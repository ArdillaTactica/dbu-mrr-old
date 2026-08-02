/**
 * Duel Maneuver — interactive two-player chat flow (actions-combat.txt:507-544).
 *
 * Architecture: the chat message is a static shell; every client rebuilds the
 * card UI in renderChatMessage from BOTH participants' actor flags
 * (flags["DBU-MRR-OLD"].duels[duelId]). Each player only ever writes their OWN
 * actor's flags (owner permission), so no message-update permission problems.
 * An updateActor hook re-renders the card on every client when either side
 * changes — synchronized UI without sockets.
 *
 * Flow: defender initiates from the Combat Tracker (Power Duel or Duel Clash +
 * their Initiating Attack) → attacker Accepts (picks their attack) or tries
 * Duel Escape (Impulsive Clash) → both secretly split a Ki Wager pool
 * (total ≤ 1/2 Max Capacity) across the 3 Duel Clashes → both press REVEAL
 * (rolls happen at each side's reveal) → when both revealed, the 3 clashes
 * resolve (best of 3) → winner rolls Wound (+ total wagers of all involved),
 * loser sends it to their Damage Tracker. 3rd-clash tie → both lose LP equal
 * to 1/2 the total wagered.
 */

const SYS = "DBU-MRR-OLD";

/* ------------------------------------------------------------------ */
/* Duel-side math                                                      */
/* ------------------------------------------------------------------ */

/**
 * Compute one side's Duel Clash roll data.
 * mode "power": Might Clash — 1d10 + Might (for Clashes).
 * mode "clash": wound ToP dice + max(FO, MA) Modifier
 *   +2(T) per EC on the Initiating Attack and per Superior/Surging state
 *   +1(T) per Power Shot rank, Super Stack, Raging/Mindful state, and
 *          wound-boosting resource stack (Power stacks, Battle Born wound).
 * Wound CT reductions apply to the Duel Clash (crit detection).
 */
export function computeDuelSide(actor, { mode = "clash", ec = 0, ps = 0, foundation = "" } = {}) {
  const system = actor.system;
  const tier = system.tier || 1;
  const sheet = actor.sheet;
  const breakdown = [];
  let dice = "1d10";
  let mod = 0;

  if (mode === "power") {
    mod = system.status?.mightForClashes ?? system.status?.might ?? 0;
    breakdown.push(`Might +${mod}`);
  } else {
    // Base Die + the Wound Roll's Tier of Power Extra Dice (rule: "Any Tier of
    // Power Extra Dice that would be applied to the Wound Roll of the
    // Initiating Attack are also applied to the Duel Clash").
    const dp = system.dicePools || {};
    const topCat = (dp.topCatBonus?.global || 0) + (dp.topCatBonus?.wound || 0);
    const extra = sheet._resolveExtraDice(tier, 0, topCat);
    dice = `1d10${extra ? `+${extra}` : ""}`;
    if (system.combatStates?.superior) {
      const grCat = (dp.greaterCatBonus?.global || 0) + (dp.greaterCatBonus?.wound || 0);
      const gr = sheet._resolveExtraDice(tier, 1, grCat);
      if (gr) dice += `+${gr}`;
    }
    const fo = system.attributes?.fo?.totalScore ?? 0;
    const ma = system.attributes?.ma?.totalScore ?? 0;
    mod = Math.max(fo, ma);
    breakdown.push(`${fo >= ma ? "FO" : "MA"} +${mod}`);
    // +2(T): EC on Initiating Attack + big states (Superior / Surging)
    const cs = system.combatStates || {};
    const bigStates = (cs.superior ? 1 : 0) + (cs.surging ? 1 : 0);
    if (ec > 0) { mod += 2 * tier * ec; breakdown.push(`EC ${ec} +${2 * tier * ec}`); }
    if (bigStates > 0) { mod += 2 * tier * bigStates; breakdown.push(`States(2T) +${2 * tier * bigStates}`); }
    // +1(T): PS ranks, Super Stacks, Raging/Mindful, wound-resource stacks
    const smallStates = (cs.raging ? 1 : 0) + (cs.mindful ? 1 : 0);
    const superStacks = system.status?.superStacks || 0;
    const powerStacks = system.tracking?.powerStacks || 0;
    const bbWound = system.battleBorn?.wound || 0;
    const smallTotal = ps + superStacks + smallStates + powerStacks + bbWound;
    if (ps > 0) breakdown.push(`PS ${ps} +${tier * ps}`);
    if (superStacks > 0) breakdown.push(`SuperStk +${tier * superStacks}`);
    if (smallStates > 0) breakdown.push(`States(1T) +${tier * smallStates}`);
    if (powerStacks + bbWound > 0) breakdown.push(`Wound res. +${tier * (powerStacks + bbWound)}`);
    mod += tier * smallTotal;
  }

  const woundCT = sheet._calcCombatCTs(system, { foundation }).woundCT;
  const wagerCap = Math.floor((system.status?.maxCapacity || 0) / 2);
  return { dice, mod, breakdown, woundCT, wagerCap, tier, baseTier: system.baseTier || 1 };
}

/* ------------------------------------------------------------------ */
/* Flag helpers                                                        */
/* ------------------------------------------------------------------ */

function getDuelState(actor, duelId) {
  return actor?.getFlag(SYS, `duels.${duelId}`) || null;
}
async function setDuelState(actor, duelId, patch) {
  const cur = getDuelState(actor, duelId) || {};
  return actor.setFlag(SYS, `duels.${duelId}`, foundry.utils.mergeObject(cur, patch, { inplace: false }));
}
function findAttacker(duelId, defenderId) {
  return game.actors.find(a =>
    a.id !== defenderId && a.getFlag(SYS, `duels.${duelId}`)?.role === "attacker"
  ) || null;
}
function findSupporters(duelId, defenderId, attackerId) {
  return game.actors.filter(a =>
    a.id !== defenderId && a.id !== attackerId &&
    a.getFlag(SYS, `duels.${duelId}`)?.role === "support"
  );
}
/**
 * United Duel supporter wager cap: 1/10 of Max Capacity — doubled by the
 * Teamwork talent ("Double the maximum amount you can Ki Wager when using
 * the United Attack Maneuver", talents.txt).
 */
export function unitedWagerCap(actor) {
  const base = Math.floor((actor.system.status?.maxCapacity || 0) / 10);
  const hasTeamwork = (actor.system.talents || []).includes("teamwork");
  return base * (hasTeamwork ? 2 : 1);
}

/** United Attack Maneuver wager cap on an attack: 1/4 Max Capacity (×2 Teamwork). */
export function unitedAttackWagerCap(actor) {
  const base = Math.floor((actor.system.status?.maxCapacity || 0) / 4);
  const hasTeamwork = (actor.system.talents || []).includes("teamwork");
  return base * (hasTeamwork ? 2 : 1);
}

/** United Attack on a Duel: 1/10 Max Capacity PER roll (×2 Teamwork). */
export function unitedAttackDuelClashCap(actor) {
  const base = Math.floor((actor.system.status?.maxCapacity || 0) / 10);
  const hasTeamwork = (actor.system.talents || []).includes("teamwork");
  return base * (hasTeamwork ? 2 : 1);
}

/**
 * United Attack "Additional Power": 1/2 of the relevant Attribute Modifier
 * (FO for Physical/Energy attacks, MA for Magic) — or 1/4 for Duel Maneuvers.
 */
export function unitedAttackPowerBonus(actor, foundation, { duel = false } = {}) {
  const isMagic = String(foundation).toLowerCase() === "magic";
  const attrKey = isMagic ? "ma" : "fo";
  const mod = actor.system.attributes?.[attrKey]?.totalScore ?? 0;
  return {
    attr: attrKey.toUpperCase(),
    mod,
    bonus: Math.floor(mod / (duel ? 4 : 2))
  };
}

/* ------------------------------------------------------------------ */
/* Initiation (called from the character sheet tracker)                */
/* ------------------------------------------------------------------ */

export async function initiateDuel(defActor, opts) {
  const duelId = foundry.utils.randomID(10);
  const side = computeDuelSide(defActor, opts);
  await setDuelState(defActor, duelId, {
    role: "defender",
    mode: opts.mode,
    sourceName: opts.sourceName || (opts.mode === "power" ? "Power Duel" : "Attack"),
    foundation: opts.foundation || "",
    ec: opts.ec || 0,
    ps: opts.ps || 0,
    woundFormula: opts.woundFormula || "",
    damageCat: opts.damageCat || "Standard",
    dice: side.dice, mod: side.mod, breakdown: side.breakdown,
    woundCT: side.woundCT, wagerCap: side.wagerCap,
    wagers: [0, 0, 0],
    revealed: false,
    rolls: null
  });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: defActor }),
    content: `<div class="dbu-duel-shell" data-duel-id="${duelId}"></div>`,
    flags: { [SYS]: { duel: { duelId, defenderId: defActor.id } } }
  });
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

function esc(s) { return String(s ?? "").replace(/</g, "&lt;"); }

function wagerControls(actor, st, { allRevealed }) {
  if (!st.revealed && actor.isOwner) {
    const inputs = [0, 1, 2].map(i =>
      `<input type="number" class="dbu-duel-wager" data-actor-id="${actor.id}" data-clash="${i}" value="${st.wagers?.[i] || 0}" min="0" title="Ki Wager for Duel Clash ${i + 1}" />`
    ).join("");
    const spent = (st.wagers || []).reduce((a, b) => a + (Number(b) || 0), 0);
    return `<div class="dbu-duel-wager-row">
      <span class="dbu-roll-label">Wagers</span>${inputs}
      <span class="dbu-duel-cap ${spent > st.wagerCap ? "over" : ""}">${spent}/${st.wagerCap}</span>
    </div>
    <div class="dbu-attack-actions">
      <button type="button" class="dbu-reveal-btn dbu-duel-reveal" data-actor-id="${actor.id}"><i class="fas fa-eye"></i> REVEAL</button>
    </div>`;
  }
  if (!st.revealed) {
    return `<div class="dbu-duel-waiting"><i class="fas fa-hourglass-half"></i> Setting wagers…</div>`;
  }
  if (!allRevealed) {
    return `<div class="dbu-duel-waiting dbu-duel-locked"><i class="fas fa-lock"></i> Locked in — waiting</div>`;
  }
  return "";
}

function sidePanel(actor, st, { allRevealed, unitedChip = "" }) {
  const name = esc(actor.name);
  const modeLabel = st.mode === "power" ? "Power Duel (Might)" : `Duel Clash — ${esc(st.sourceName)}`;
  const chips = [
    `<span class="dbu-meta-chip">${modeLabel}</span>`,
    ...(st.breakdown || []).map(b => `<span class="dbu-meta-chip">${esc(b)}</span>`),
    unitedChip
  ].filter(Boolean).join("");
  return `<div class="dbu-duel-side">
    <div class="dbu-duel-side-name">${name}</div>
    <div class="dbu-attack-meta">${chips}</div>
    ${wagerControls(actor, st, { allRevealed })}
  </div>`;
}

/** United supporter strip (United Duel co-targets + United Attack allies). */
function supporterStrip(supporters, { allRevealed, showJoin, defName = "", attName = "" }) {
  const rows = supporters.map(({ actor, st }) => {
    const tag = st.uaMode
      ? `<span class="dbu-meta-chip">United Attack → ${esc(st.side === "attacker" ? attName : defName)} · +${st.woundBonus} Wound (¼${esc(st.woundAttr || "")})</span>`
      : `<span class="dbu-meta-chip">United Duel (primary)</span>`;
    return `<div class="dbu-duel-support-row">
      <span class="dbu-duel-support-name"><i class="fas fa-hands-helping"></i> ${esc(actor.name)}</span> ${tag}
      ${wagerControls(actor, st, { allRevealed })}
    </div>`;
  }).join("");
  const joinBtn = showJoin
    ? `<div class="dbu-attack-actions">
        <button type="button" class="dbu-pay-btn dbu-duel-join"><i class="fas fa-hands-helping"></i> Join (United Duel / United Attack)</button>
      </div>`
    : "";
  if (!rows && !joinBtn) return "";
  return `<div class="dbu-duel-united">
    ${rows ? `<div class="dbu-duel-united-title">UNITED SUPPORT</div>${rows}` : ""}
    ${joinBtn}
  </div>`;
}

function resolutionHtml(defActor, attActor, defSt, attSt, supporters = []) {
  const rows = [];
  let defWins = 0, attWins = 0;
  const sumW = (st) => (st.wagers || []).reduce((a, b) => a + (Number(b) || 0), 0);
  // Total pool includes every participant's wagers (winner's wound bonus /
  // tie loss both use "the total Ki Wager used by ALL Characters involved").
  const totalWagerAll = sumW(defSt) + sumW(attSt)
    + supporters.reduce((acc, s) => acc + sumW(s.st), 0);
  // United Duel co-targets: +1(T) flat per ally + their wagers, PRIMARY only.
  // United Attack allies: their per-clash wagers boost their chosen side; the
  // +1/4 Attribute bonus applies to the winner's Wound (not the clashes).
  const udSupport = supporters.filter(s => !s.st.uaMode);
  const uaDef = supporters.filter(s => s.st.uaMode && s.st.side !== "attacker");
  const uaAtt = supporters.filter(s => s.st.uaMode && s.st.side === "attacker");
  const defTier = defActor.system.tier || 1;
  const unitedFlat = udSupport.length * defTier;
  const sumClash = (list, i) => list.reduce((acc, s) => acc + (Number(s.st.wagers?.[i]) || 0), 0);
  for (let i = 0; i < 3; i++) {
    const d = defSt.rolls?.[i], a = attSt.rolls?.[i];
    if (!d || !a) continue;
    const defBoost = unitedFlat + sumClash(udSupport, i) + sumClash(uaDef, i);
    const attBoost = sumClash(uaAtt, i);
    const dTotal = d.total + defBoost;
    const aTotal = a.total + attBoost;
    let winner = "tie";
    if (dTotal > aTotal) { winner = "def"; defWins++; }
    else if (aTotal > dTotal) { winner = "att"; attWins++; }
    const tagFor = (r) => r.crit
      ? ` <span class="dbu-crit">CRIT +${r.critTotal}</span>`
      : (r.botch ? ` <span class="dbu-botch">BOTCH</span>` : "");
    const defTag = defBoost > 0
      ? `<span class="dbu-duel-wager-tag" title="United: +${unitedFlat} allies + ${defBoost - unitedFlat} wagers">u${defBoost}</span>`
      : "";
    const attTag = attBoost > 0
      ? `<span class="dbu-duel-wager-tag" title="United Attack wagers">u${attBoost}</span>`
      : "";
    rows.push(`<div class="dbu-duel-clash-row ${winner === "def" ? "win-left" : winner === "att" ? "win-right" : "win-tie"}">
      <span class="dbu-duel-clash-val">${dTotal}<span class="dbu-duel-wager-tag">w${d.wager}</span>${defTag}${tagFor(d)}</span>
      <span class="dbu-duel-clash-num">C${i + 1}</span>
      <span class="dbu-duel-clash-val right">${tagFor(a)}<span class="dbu-duel-wager-tag">w${a.wager}</span>${attTag}${aTotal}</span>
    </div>`);
  }
  // United Attack "Additional Power" (¼ Attribute) for whichever side wins
  const uaWoundBonus = (side) =>
    (side === "def" ? uaDef : uaAtt).reduce((acc, s) => acc + (Number(s.st.woundBonus) || 0), 0);
  let outcome, outcomeHtml = "";
  if (defWins >= 2 || attWins >= 2) {
    const winSide = defWins >= 2 ? "def" : "att";
    const winSt = defWins >= 2 ? defSt : attSt;
    const winActor = defWins >= 2 ? defActor : attActor;
    const loseActor = defWins >= 2 ? attActor : defActor;
    const uaBonus = uaWoundBonus(winSide);
    const uaChip = uaBonus > 0 ? `<span class="dbu-meta-chip">United Attack +${uaBonus} Wound (¼ Attr)</span>` : "";
    outcome = `<span class="dbu-duel-winner">${esc(winActor.name)} WINS THE DUEL ${defWins}–${attWins}</span>`;
    if (winSt.mode === "power") {
      const might = winActor.system.status?.mightForClashes ?? winActor.system.status?.might ?? 0;
      const score = might + totalWagerAll + uaBonus;
      outcomeHtml = `<div class="dbu-duel-wound">
        <span class="dbu-meta-chip">Power Duel Wound Score: Might ${might} + Wagers ${totalWagerAll}${uaBonus ? ` + United ${uaBonus}` : ""} = <b>${score}</b></span>
        ${uaChip}
        <span class="dbu-meta-chip">Loser: Shaken until threshold (rules)</span>
        <button type="button" class="dbu-pay-btn dbu-duel-send" data-wound="${score}" data-cat="Standard" data-loser-id="${loseActor.id}">
          <i class="fas fa-heart-broken"></i> Send ${score} to ${esc(loseActor.name)}'s Damage Tracker
        </button>
      </div>`;
    } else if (winSt.woundResult != null) {
      outcomeHtml = `<div class="dbu-duel-wound">
        <span class="dbu-meta-chip">Wound: <code>${esc(winSt.woundResultFormula)}</code> = <b>${winSt.woundResult}</b> (incl. +${totalWagerAll} total wagers${uaBonus ? ` + United ${uaBonus}` : ""})</span>
        ${uaChip}
        <button type="button" class="dbu-pay-btn dbu-duel-send" data-wound="${winSt.woundResult}" data-cat="${esc(winSt.damageCat)}" data-loser-id="${loseActor.id}">
          <i class="fas fa-heart-broken"></i> Send to ${esc(loseActor.name)}'s Damage Tracker
        </button>
      </div>`;
    } else {
      outcomeHtml = `<div class="dbu-duel-wound">
        ${uaChip}
        <button type="button" class="dbu-pay-btn dbu-duel-roll-wound" data-winner-id="${winActor.id}" data-total-wager="${totalWagerAll}" data-ua-bonus="${uaBonus}">
          <i class="fas fa-dice-d20"></i> ${esc(winActor.name)}: Roll Wound (+${totalWagerAll} wagers${uaBonus ? ` +${uaBonus} United` : ""})
        </button>
      </div>`;
    }
  } else {
    const tieLoss = Math.ceil(totalWagerAll / 2);
    outcome = `<span class="dbu-duel-winner tie">DUEL TIE ${defWins}–${attWins}</span>`;
    const tieBtns = [defActor, attActor, ...supporters.map(s => s.actor)]
      .map(a => `<button type="button" class="dbu-pay-btn dbu-duel-tie" data-loss="${tieLoss}" data-target-id="${a.id}">−${tieLoss} LP ${esc(a.name)}</button>`)
      .join("");
    outcomeHtml = `<div class="dbu-duel-wound">
      <span class="dbu-meta-chip">All participants lose <b>${tieLoss}</b> LP (1/2 total wagered)</span>
      ${tieBtns}
    </div>`;
  }
  return `<div class="dbu-duel-resolution">
    ${rows.join("")}
    <div class="dbu-duel-outcome">${outcome}</div>
    ${outcomeHtml}
  </div>`;
}

function buildDuelCard(message) {
  const meta = message.getFlag(SYS, "duel");
  if (!meta) return null;
  const defActor = game.actors.get(meta.defenderId);
  if (!defActor) return null;
  const defSt = getDuelState(defActor, meta.duelId);
  if (!defSt) return null;
  const attActor = findAttacker(meta.duelId, meta.defenderId);
  const attSt = attActor ? getDuelState(attActor, meta.duelId) : null;
  const supporters = findSupporters(meta.duelId, meta.defenderId, attActor?.id)
    .map(a => ({ actor: a, st: getDuelState(a, meta.duelId) }))
    .filter(s => s.st);
  // Resolution waits for BOTH main sides AND every United supporter to lock in.
  const allRevealed = !!(defSt.revealed && attSt?.revealed && supporters.every(s => s.st.revealed));

  const header = `<h3 class="dbu-attack-title"><span class="dbu-card-title-text"><i class="fas fa-bolt"></i> DUEL — ${esc(defActor.name)}${attActor ? ` vs ${esc(attActor.name)}` : ""}</span><span class="dbu-action-count">CTR</span></h3>`;

  let attArea;
  if (attSt?.escaped === "success") {
    attArea = `<div class="dbu-duel-side"><div class="dbu-duel-waiting"><i class="fas fa-running"></i> ${esc(attActor.name)} ESCAPED the duel — attack nullified, Counter Action refunded.</div></div>`;
  } else if (!attActor) {
    attArea = `<div class="dbu-duel-side">
      <div class="dbu-duel-waiting"><i class="fas fa-question-circle"></i> Awaiting challenger…</div>
      <div class="dbu-attack-actions">
        <button type="button" class="dbu-pay-btn dbu-duel-accept"><i class="fas fa-fist-raised"></i> Accept Duel</button>
        <button type="button" class="dbu-pay-btn dbu-duel-escape"><i class="fas fa-running"></i> Duel Escape</button>
      </div>
    </div>`;
  } else {
    attArea = sidePanel(attActor, attSt, { allRevealed });
  }

  const defTier = defActor.system.tier || 1;
  const udCount = supporters.filter(s => !s.st.uaMode).length;
  const unitedChip = udCount > 0
    ? `<span class="dbu-meta-chip" title="United Duel: +1(T) per co-target ally + their wagers at resolution">United ×${udCount} +${udCount * defTier}</span>`
    : "";
  const defArea = sidePanel(defActor, defSt, { allRevealed, unitedChip });
  // Allies can join until the duel resolves (they wager at the start of the clashes)
  const showJoin = !!attActor && !attSt?.escaped && !allRevealed;
  const unitedArea = supporterStrip(supporters, {
    allRevealed, showJoin,
    defName: defActor.name, attName: attActor?.name || ""
  });
  const resolution = (allRevealed && attSt && !attSt.escaped)
    ? resolutionHtml(defActor, attActor, defSt, attSt, supporters)
    : "";

  return `${header}<div class="dbu-card-body">
    ${defArea}
    ${unitedArea}
    <div class="dbu-duel-vs">VS</div>
    ${attArea}
    ${resolution}
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Roll helpers                                                        */
/* ------------------------------------------------------------------ */

async function rollDuelSide(actor, duelId) {
  const st = getDuelState(actor, duelId);
  if (!st || st.revealed) return;
  const sheet = actor.sheet;
  const tier = st.mode === "power" ? (actor.system.tier || 1) : (actor.system.tier || 1);
  const baseTier = actor.system.baseTier || 1;
  const wagers = (st.wagers || [0, 0, 0]).map(w => Math.max(0, Number(w) || 0));
  const spent = wagers.reduce((a, b) => a + b, 0);
  if (spent > st.wagerCap) {
    ui.notifications.warn(`Total wager ${spent} exceeds the cap of ${st.wagerCap} (1/2 Max Capacity).`);
    return;
  }
  const rolls = [];
  for (let i = 0; i < 3; i++) {
    const formula = `${st.dice}+${st.mod + wagers[i]}`;
    const roll = new Roll(formula);
    await roll.evaluate();
    const nat = roll.dice[0]?.results?.[0]?.result ?? 0;
    const crit = nat >= (st.woundCT || 10);
    const botch = nat === 1;
    let critTotal = 0;
    if (crit) {
      const cr = new Roll(sheet._critExtraFormula(tier));
      await cr.evaluate();
      critTotal = cr.total;
    }
    rolls.push({
      formula, nat, wager: wagers[i], crit, botch, critTotal,
      total: roll.total + critTotal - (botch ? 2 * baseTier : 0)
    });
  }
  // Pay the wagers now (they're committed at reveal)
  if (spent > 0) {
    const ki = actor.system.kiPool?.value ?? 0;
    await actor.update({ "system.kiPool.value": Math.max(0, ki - spent) });
  }
  await setDuelState(actor, duelId, { revealed: true, wagers, rolls });
  try { foundry.audio.AudioHelper.play({ src: CONFIG.sounds.dice }, true); } catch (e) { /* no-op */ }
}

/** United supporter lock-in: validate cap, pay the wagers, no rolls. */
async function lockSupportSide(actor, duelId) {
  const st = getDuelState(actor, duelId);
  if (!st || st.revealed) return;
  const wagers = (st.wagers || [0, 0, 0]).map(w => Math.max(0, Number(w) || 0));
  const spent = wagers.reduce((a, b) => a + b, 0);
  if (st.uaMode) {
    // United Attack on a Duel: the cap applies PER clash ("up to 1/10th of
    // your Max Capacity on each roll").
    const over = wagers.findIndex(w => w > st.wagerCap);
    if (over >= 0) {
      ui.notifications.warn(`Clash ${over + 1} wager ${wagers[over]} exceeds the per-clash cap of ${st.wagerCap} (1/10 Max Capacity${(actor.system.talents || []).includes("teamwork") ? " ×2 Teamwork" : ""}).`);
      return;
    }
  } else if (spent > st.wagerCap) {
    ui.notifications.warn(`Total United wager ${spent} exceeds the cap of ${st.wagerCap} (1/10 Max Capacity${(actor.system.talents || []).includes("teamwork") ? " ×2 Teamwork" : ""}).`);
    return;
  }
  if (spent > 0) {
    const ki = actor.system.kiPool?.value ?? 0;
    await actor.update({ "system.kiPool.value": Math.max(0, ki - spent) });
  }
  await setDuelState(actor, duelId, { revealed: true, wagers });
}

/* ------------------------------------------------------------------ */
/* Event wiring                                                        */
/* ------------------------------------------------------------------ */

function onRenderDuelMessage(message, html) {
  const $html = html instanceof HTMLElement ? $(html) : html;
  const shell = $html.find(".dbu-duel-shell")[0];
  if (!shell) return;
  const meta = message.getFlag(SYS, "duel");
  if (!meta) return;
  const card = buildDuelCard(message);
  if (!card) return;
  shell.innerHTML = card;
  shell.classList.add("dbu-attack-roll", "dbu-duel-card");
  const duelId = meta.duelId;
  const defActor = game.actors.get(meta.defenderId);
  const attActor = findAttacker(duelId, meta.defenderId);

  // Wager inputs (all sides + United supporters — resolved via data-actor-id)
  shell.querySelectorAll(".dbu-duel-wager").forEach(inp => {
    inp.addEventListener("change", async () => {
      const actor = game.actors.get(inp.dataset.actorId);
      if (!actor?.isOwner) return;
      const st = getDuelState(actor, duelId);
      if (!st || st.revealed) return;
      const wagers = [...(st.wagers || [0, 0, 0])];
      wagers[Number(inp.dataset.clash)] = Math.max(0, Number(inp.value) || 0);
      await setDuelState(actor, duelId, { wagers });
    });
  });

  // Reveal — main sides roll their 3 clashes; supporters just commit wagers
  shell.querySelectorAll(".dbu-duel-reveal").forEach(btn => {
    btn.addEventListener("click", async () => {
      const actor = game.actors.get(btn.dataset.actorId);
      if (!actor?.isOwner) return ui.notifications.warn("You don't control this side.");
      btn.disabled = true;
      const st = getDuelState(actor, duelId);
      if (st?.role === "support") await lockSupportSide(actor, duelId);
      else await rollDuelSide(actor, duelId);
    });
  });

  // Accept Duel (become the attacker)
  shell.querySelectorAll(".dbu-duel-accept").forEach(btn => {
    btn.addEventListener("click", async () => {
      const actor = await pickUserActor(meta.defenderId);
      if (!actor) return;
      await promptAttackerSetup(actor, duelId);
    });
  });

  // Join as ally: United Duel (co-target supporting the primary) or United
  // Attack Maneuver (support EITHER duelist: +1/4 relevant Attribute to their
  // Wound, wager up to 1/10 Max Capacity PER clash, pays the Profile's KP).
  shell.querySelectorAll(".dbu-duel-join").forEach(btn => {
    btn.addEventListener("click", async () => {
      const exclude = [meta.defenderId, attActor?.id].filter(Boolean);
      const owned = game.actors.filter(a =>
        a.type === "character" && a.isOwner && !exclude.includes(a.id) &&
        !a.getFlag(SYS, `duels.${duelId}`)
      );
      if (!owned.length) return ui.notifications.warn("You own no eligible character to join.");
      let actor = owned.length === 1 ? owned[0] : null;
      if (!actor) {
        const choice = await Dialog.wait({
          title: "Join Duel — choose your character",
          content: `<select id="dbu-duel-join-pick" style="width:100%">${owned.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join("")}</select>`,
          buttons: {
            ok: { label: "Choose", callback: (h) => h.find("#dbu-duel-join-pick").val() },
            cancel: { label: "Cancel", callback: () => null }
          },
          close: () => null
        });
        if (!choice) return;
        actor = game.actors.get(choice);
      }
      const hasTeamwork = (actor.system.talents || []).includes("teamwork");
      const udCap = unitedWagerCap(actor);
      const uaCap = unitedAttackDuelClashCap(actor);
      const joinType = await Dialog.wait({
        title: `${actor.name} — how do you join?`,
        content: `<p style="font-size:0.85em">
          <b>United Duel</b>: co-target of the attack — supports the primary (+1(T) to their clashes, wager ≤ ${udCap} total).<br>
          <b>United Attack</b> [1/Round]: adjacent ally of a duelist — +1/4 your relevant Attribute to their Wound, wager ≤ ${uaCap} PER clash, pays the Profile's KP cost.</p>`,
        buttons: {
          ud: { label: "United Duel (primary)", callback: () => ({ type: "ud" }) },
          uaDef: { label: `United Attack → ${esc(defActor.name)}`, callback: () => ({ type: "ua", side: "defender" }) },
          uaAtt: attActor ? { label: `United Attack → ${esc(attActor.name)}`, callback: () => ({ type: "ua", side: "attacker" }) } : undefined,
          cancel: { label: "Cancel", callback: () => null }
        },
        close: () => null
      });
      if (!joinType) return;

      if (joinType.type === "ud") {
        await setDuelState(actor, duelId, {
          role: "support", wagerCap: udCap, wagers: [0, 0, 0], revealed: false
        });
        ui.notifications.info(`${actor.name} joins the United Duel — wager cap ${udCap} KP${hasTeamwork ? " (doubled by Teamwork)" : ""}.`);
        return;
      }

      // United Attack: bonus keyed to the SUPPORTED duelist's attack foundation
      const sideActor = joinType.side === "attacker" ? attActor : defActor;
      const sideSt = getDuelState(sideActor, duelId);
      const power = unitedAttackPowerBonus(actor, sideSt?.foundation || "", { duel: true });
      const profileCost = await Dialog.wait({
        title: `United Attack — ${actor.name}: KP cost of your Profile/Sig Tech`,
        content: `<div class="form-group"><label>KP Cost</label><input type="number" name="cost" value="0" min="0"/></div>`,
        buttons: {
          ok: { label: "Pay & Join", callback: (h) => Math.max(0, Number(h.find("[name=cost]").val()) || 0) },
          cancel: { label: "Cancel", callback: () => null }
        },
        close: () => null
      });
      if (profileCost === null) return;
      if (profileCost > 0) {
        const ki = actor.system.kiPool?.value ?? 0;
        await actor.update({ "system.kiPool.value": Math.max(0, ki - profileCost) });
        const whisperIds = game.users
          .filter(u => u.isGM || actor.testUserPermission(u, "OWNER"))
          .map(u => u.id);
        await ChatMessage.create({
          content: `<div class="dbu-ki-deduct"><i class="fas fa-hands-helping"></i> <b>${esc(actor.name)}</b>: United Attack (Duel) -${profileCost} KP. Remaining KP: <b>${Math.max(0, ki - profileCost)}</b></div>`,
          whisper: whisperIds,
          speaker: ChatMessage.getSpeaker({ actor })
        });
      }
      await setDuelState(actor, duelId, {
        role: "support", uaMode: true, side: joinType.side,
        wagerCap: uaCap, woundBonus: power.bonus, woundAttr: power.attr,
        wagers: [0, 0, 0], revealed: false
      });
      ui.notifications.info(`${actor.name} joins via United Attack (${sideActor.name}'s side) — +${power.bonus} Wound (¼ ${power.attr}), wager ≤ ${uaCap}/clash${hasTeamwork ? " (Teamwork ×2)" : ""}.`);
    });
  });

  // Duel Escape (Impulsive Clash)
  shell.querySelectorAll(".dbu-duel-escape").forEach(btn => {
    btn.addEventListener("click", async () => {
      const actor = await pickUserActor(meta.defenderId);
      if (!actor) return;
      const mine = new Roll(`1d10+${actor.system.savingThrows?.impulsive?.bonus || 0}`);
      const theirs = new Roll(`1d10+${defActor.system.savingThrows?.impulsive?.bonus || 0}`);
      await mine.evaluate(); await theirs.evaluate();
      const success = mine.total > theirs.total;
      await setDuelState(actor, duelId, { role: "attacker", escaped: success ? "success" : "failed" });
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<div class="dbu-round-card">
          <div class="dbu-round-num"><i class="fas fa-running"></i> ${success ? "ESC" : "FAIL"}</div>
          <div class="dbu-round-info">
            <span class="dbu-round-title">Duel Escape — ${esc(actor.name)}</span>
            <span class="dbu-round-detail">Impulsive ${mine.total} vs ${theirs.total} — ${success ? "escaped! Attack nullified, Counter refunded" : "failed — the Duel proceeds"}</span>
          </div>
        </div>`
      });
      if (!success) await promptAttackerSetup(actor, duelId, { keepEscape: true });
    });
  });

  // Winner: roll Wound (+ total wagers)
  shell.querySelectorAll(".dbu-duel-roll-wound").forEach(btn => {
    btn.addEventListener("click", async () => {
      const winActor = game.actors.get(btn.dataset.winnerId);
      if (!winActor?.isOwner) return ui.notifications.warn("Only the winner (or GM) rolls the Wound.");
      const st = getDuelState(winActor, duelId);
      if (!st || st.woundResult != null) return;
      const totalWager = Number(btn.dataset.totalWager) || 0;
      const uaBonus = Number(btn.dataset.uaBonus) || 0;
      const base = st.woundFormula || "1d10";
      const formula = `${base}+${totalWager}${uaBonus ? `+${uaBonus}` : ""}`;
      const roll = new Roll(formula);
      await roll.evaluate();
      await setDuelState(winActor, duelId, { woundResult: roll.total, woundResultFormula: formula });
      try { foundry.audio.AudioHelper.play({ src: CONFIG.sounds.dice }, true); } catch (e) { /* no-op */ }
    });
  });

  // Send winner's wound to the loser's Damage Tracker
  shell.querySelectorAll(".dbu-duel-send").forEach(btn => {
    btn.addEventListener("click", async () => {
      const loser = game.actors.get(btn.dataset.loserId);
      if (!loser?.isOwner) return ui.notifications.warn("Only the losing side (or GM) applies this.");
      const catKey = String(btn.dataset.cat || "Standard").toLowerCase();
      await loser.update({
        "system.damageCalc.woundRoll": Number(btn.dataset.wound) || 0,
        "system.damageCalc.category": ["standard", "direct", "lethal"].includes(catKey) ? catKey : "standard",
        "system.damageCalc.defense": "none",
        "system.damageCalc.source": "wound"
      });
      ui.notifications.info(`${loser.name}: Wound ${btn.dataset.wound} loaded — open Combat tab → Apply Damage.`);
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-check"></i> Loaded — press Apply Damage`;
    });
  });

  // Tie: direct LP loss (1/2 total wagered)
  shell.querySelectorAll(".dbu-duel-tie").forEach(btn => {
    btn.addEventListener("click", async () => {
      const target = game.actors.get(btn.dataset.targetId);
      if (!target?.isOwner) return ui.notifications.warn("You don't control this character.");
      const loss = Number(btn.dataset.loss) || 0;
      const lp = target.system.lifePoints?.value ?? 0;
      await target.update({ "system.lifePoints.value": Math.max(0, lp - loss) });
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-check"></i> Applied`;
    });
  });
}

/** Resolve which of the current user's actors enters the duel. */
async function pickUserActor(excludeId) {
  const owned = game.actors.filter(a => a.type === "character" && a.isOwner && a.id !== excludeId);
  if (owned.length === 0) { ui.notifications.warn("You own no eligible character."); return null; }
  if (game.user.character && game.user.character.id !== excludeId) return game.user.character;
  if (owned.length === 1) return owned[0];
  const choice = await Dialog.wait({
    title: "Duel — choose your character",
    content: `<select id="dbu-duel-actor-pick" style="width:100%">${owned.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join("")}</select>`,
    buttons: {
      ok: { label: "Enter Duel", callback: (h) => h.find("#dbu-duel-actor-pick").val() },
      cancel: { label: "Cancel", callback: () => null }
    },
    close: () => null
  });
  return choice ? game.actors.get(choice) : null;
}

/** Attacker chooses their Initiating Attack (their original attack) + EC/PS. */
async function promptAttackerSetup(actor, duelId, { keepEscape = false } = {}) {
  const refs = (actor.system.attackRefs || []).map((r, i) => ({
    key: `ref_${i}`, name: r.name || `Attack ${i + 1}`, foundation: r.foundation || "",
    ec: r.energyCharges || 0, ps: r.powerShot || 0
  })).filter(r => r.name);
  const options = refs.map(r => `<option value="${r.key}">${esc(r.name)}</option>`).join("");
  const result = await Dialog.wait({
    title: `Duel — ${actor.name}: your Initiating Attack`,
    content: `<form>
      <div class="form-group"><label>Attack</label>
        <select name="src">${options || `<option value="">(none — manual)</option>`}</select></div>
      <div class="form-group"><label>Energy Charges on it</label><input type="number" name="ec" value="0" min="0"/></div>
      <div class="form-group"><label>Power Shot ranks</label><input type="number" name="ps" value="0" min="0"/></div>
    </form>`,
    buttons: {
      ok: {
        label: "Enter Duel",
        callback: (h) => ({
          src: h.find("[name=src]").val(),
          ec: Number(h.find("[name=ec]").val()) || 0,
          ps: Number(h.find("[name=ps]").val()) || 0
        })
      },
      cancel: { label: "Cancel", callback: () => null }
    },
    close: () => null
  });
  if (!result) return;
  const ref = refs.find(r => r.key === result.src);
  // Wound formula for the winner roll: reuse the sheet-prepared formula when available
  let woundFormula = "1d10";
  let damageCat = "Standard";
  try {
    const prep = await actor.sheet.getData();
    const idx = Number((result.src || "").split("_")[1]);
    const prepRef = (prep.attackRefs || [])[idx];
    if (prepRef?.woundFormula) woundFormula = prepRef.woundFormula;
    if (prepRef?.damageCat) damageCat = prepRef.damageCat;
  } catch (e) { /* fallback stays */ }
  const side = computeDuelSide(actor, { mode: "clash", ec: result.ec, ps: result.ps, foundation: ref?.foundation || "" });
  await setDuelState(actor, duelId, {
    role: "attacker",
    ...(keepEscape ? {} : { escaped: null }),
    mode: "clash",
    sourceName: ref?.name || "Attack",
    foundation: ref?.foundation || "",
    ec: result.ec, ps: result.ps,
    woundFormula, damageCat,
    dice: side.dice, mod: side.mod, breakdown: side.breakdown,
    woundCT: side.woundCT, wagerCap: side.wagerCap,
    wagers: [0, 0, 0],
    revealed: false,
    rolls: null
  });
}

/* ------------------------------------------------------------------ */
/* United Attack Maneuver on attack cards (actions-combat.txt)         */
/* ------------------------------------------------------------------ */

function getUnitedContribs(messageId) {
  return game.actors
    .map(a => ({ actor: a, c: a.getFlag(SYS, `unitedAttacks.${messageId}`) }))
    .filter(x => x.c);
}

/**
 * Injects the United Attack strip + join button into attack chat cards.
 * Joining is only possible while the attack is still HIDDEN (before Reveal —
 * you join the attack as it happens, not after it resolves). Contributions
 * stay hidden until the attack is revealed; then the strip shows each ally's
 * breakdown and the FINAL Wound including all United bonuses.
 */
function onRenderUnitedAttack(message, html) {
  const rv = message.getFlag(SYS, "attackReveal");
  if (!rv || rv.foundation === undefined) return; // old messages lack UA data
  const $html = html instanceof HTMLElement ? $(html) : html;
  const body = $html.find(".dbu-attack-roll .dbu-card-body")[0];
  if (!body) return;
  const contribs = getUnitedContribs(message.id);

  // Contribution strip
  if (contribs.length) {
    const strip = document.createElement("div");
    strip.className = "dbu-duel-united";
    const rows = contribs.map(({ actor, c }) => {
      const detail = rv.revealed
        ? `<span class="dbu-meta-chip">+${c.bonus + c.wager} (½${c.attr} ${c.bonus}${c.wager ? ` + wager ${c.wager}` : ""})</span>`
        : `<span class="dbu-meta-chip"><i class="fas fa-eye-slash"></i> bonus hidden</span>`;
      return `<div class="dbu-duel-support-row">
        <span class="dbu-duel-support-name"><i class="fas fa-hands-helping"></i> ${esc(actor.name)}</span> ${detail}
      </div>`;
    }).join("");
    const totalBonus = contribs.reduce((a, x) => a + (x.c.bonus || 0) + (x.c.wager || 0), 0);
    const finalLine = (rv.revealed && rv.woundTotal != null)
      ? `<div class="dbu-duel-support-row"><span class="dbu-meta-chip dbu-chip-hot">FINAL WOUND with United: <b>${rv.woundTotal + totalBonus}</b> (${rv.woundTotal} + ${totalBonus})</span></div>`
      : "";
    strip.innerHTML = `<div class="dbu-duel-united-title">UNITED ATTACK</div>${rows}${finalLine}`;
    body.appendChild(strip);
  }

  // Join button — hidden attacks only, [1/Round] per ally (table-enforced)
  if (!rv.revealed) {
    const actions = body.querySelector(".dbu-attack-actions");
    if (!actions) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "dbu-pay-btn dbu-united-attack-join";
    btn.innerHTML = `<i class="fas fa-hands-helping"></i> United Attack`;
    btn.title = "United Attack Maneuver [1/Round]: adjacent ally joins — pays the Profile's KP cost, adds ½ relevant Attribute + wager (≤1/4 Max Capacity, ×2 Teamwork) to the Wound.";
    actions.appendChild(btn);
    btn.addEventListener("click", async () => {
      const exclude = [rv.actorId, ...contribs.map(x => x.actor.id)];
      const owned = game.actors.filter(a =>
        a.type === "character" && a.isOwner && !exclude.includes(a.id));
      if (!owned.length) return ui.notifications.warn("You own no eligible character to join.");
      let actor = owned.length === 1 ? owned[0] : null;
      if (!actor) {
        const choice = await Dialog.wait({
          title: "United Attack — choose your character",
          content: `<select id="dbu-ua-pick" style="width:100%">${owned.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join("")}</select>`,
          buttons: {
            ok: { label: "Choose", callback: (h) => h.find("#dbu-ua-pick").val() },
            cancel: { label: "Cancel", callback: () => null }
          },
          close: () => null
        });
        if (!choice) return;
        actor = game.actors.get(choice);
      }
      const power = unitedAttackPowerBonus(actor, rv.foundation);
      const cap = unitedAttackWagerCap(actor);
      const hasTeamwork = (actor.system.talents || []).includes("teamwork");
      const profileCost = (CONFIG.DBU?.profileData?.[rv.profile]?.kpCost || 0) * (actor.system.tier || 1);
      const result = await Dialog.wait({
        title: `United Attack — ${actor.name} joins "${esc(rv.attackName)}"`,
        content: `<form>
          <p style="font-size:0.85em">Additional Power: <b>+${power.bonus}</b> (½ ${power.attr} ${power.mod}) to the ally's Wound Roll.<br>
          If using a Signature Technique you may also apply up to 1(bT) ranks of its Advantages (apply manually).</p>
          <div class="form-group"><label>Ki Wager (max ${cap}${hasTeamwork ? ", ×2 Teamwork" : ""})</label>
            <input type="number" name="wager" value="0" min="0" max="${cap}"/></div>
          <div class="form-group"><label>KP Cost (same Profile${rv.profile ? `: ${esc(rv.profile)}` : ""})</label>
            <input type="number" name="cost" value="${profileCost}" min="0"/></div>
        </form>`,
        buttons: {
          ok: {
            label: "Join United Attack",
            callback: (h) => ({
              wager: Math.max(0, Math.min(Number(h.find("[name=wager]").val()) || 0, cap)),
              cost: Math.max(0, Number(h.find("[name=cost]").val()) || 0)
            })
          },
          cancel: { label: "Cancel", callback: () => null }
        },
        close: () => null
      });
      if (!result) return;
      // Pay cost + wager now, whisper remaining KP to GM + owners
      const total = result.cost + result.wager;
      if (total > 0) {
        const ki = actor.system.kiPool?.value ?? 0;
        await actor.update({ "system.kiPool.value": Math.max(0, ki - total) });
        const whisperIds = game.users
          .filter(u => u.isGM || actor.testUserPermission(u, "OWNER"))
          .map(u => u.id);
        await ChatMessage.create({
          content: `<div class="dbu-ki-deduct"><i class="fas fa-hands-helping"></i> <b>${esc(actor.name)}</b>: United Attack -${total} KP (Cost ${result.cost}${result.wager ? ` + Wager ${result.wager}` : ""}). Remaining KP: <b>${Math.max(0, ki - total)}</b></div>`,
          whisper: whisperIds,
          speaker: ChatMessage.getSpeaker({ actor })
        });
      }
      await actor.setFlag(SYS, `unitedAttacks.${message.id}`, {
        attr: power.attr, bonus: power.bonus, wager: result.wager, cost: result.cost
      });
    });
  }
}

/** Re-render duel/attack cards on every client whenever a participant's state changes. */
function onDuelActorUpdate(actor, changes) {
  const duels = foundry.utils.getProperty(changes, `flags.${SYS}.duels`);
  if (duels) {
    for (const msg of game.messages.contents.slice(-50)) {
      const meta = msg.getFlag(SYS, "duel");
      if (!meta) continue;
      if (Object.keys(duels).some(k => k.includes(meta.duelId) || meta.duelId.includes(k.replace(/^-=/, "")))) {
        ui.chat.updateMessage(msg);
      }
    }
  }
  const uas = foundry.utils.getProperty(changes, `flags.${SYS}.unitedAttacks`);
  if (uas) {
    for (const key of Object.keys(uas)) {
      const msg = game.messages.get(key.replace(/^-=/, ""));
      if (msg) ui.chat.updateMessage(msg);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Interactive Clash cards — Grapple / Thrust Maneuvers                */
/* (actions-combat.txt:216-243 Grapple, :328-333 Thrust)               */
/* Same architecture as duels: message = static shell; each side's     */
/* state in their OWN actor flags (clashes.<clashId>); ties go to the  */
/* DEFENDER ("Defender Wins", core-rules.txt:14-17).                   */
/* ------------------------------------------------------------------ */

async function evalClashRoll(actor, formula, ct) {
  const sheet = actor.sheet;
  const tier = actor.system.tier || 1;
  const baseTier = actor.system.baseTier || 1;
  const roll = new Roll(formula);
  await roll.evaluate();
  const nat = roll.dice[0]?.results?.[0]?.result ?? 0;
  const crit = nat >= (ct || 10);
  const botch = nat === 1;
  let critTotal = 0;
  if (crit) {
    const cr = new Roll(sheet._critExtraFormula(tier));
    await cr.evaluate();
    critTotal = cr.total;
  }
  return {
    formula, nat, ct: ct || 10, crit, botch, critTotal,
    total: roll.total + critTotal - (botch ? 2 * baseTier : 0)
  };
}

function fallbackFormula(actor, kind) {
  const apt = actor.system.aptitudes || {};
  if (kind === "might") return `1d10+${actor.system.status?.mightForClashes ?? actor.system.status?.might ?? 0}`;
  if (kind === "dodge") return `1d10+${(apt.defenseValue ?? 0) + (apt.dodgeBuffTotal ?? 0)}`;
  return `1d10+${(apt.haste ?? 0) + (apt.awareness ?? 0) + (apt.strikeBuffTotal ?? 0)}`;
}

/**
 * Skill bonus for Skill Clashes (skills.txt: 1/2 Attribute SCORE + 2×rank),
 * plus Gifted Student and equipment bonuses. Skill Clashes use no ToP dice
 * (core-rules.txt:233).
 */
export function computeSkillBonus(actor, skillKey) {
  const skillDef = (CONFIG.DBU?.skillsData || []).find(s => s.id === skillKey);
  const attrKey = skillDef?.attribute || "in";
  const rank = actor.system.skills?.[skillKey]?.rank ?? actor.system.skills?.[skillKey] ?? 0;
  const attrScore = actor.system.attributes?.[attrKey]?.score ?? 0;
  const gs = actor.system.aptitudes?.giftedStudentSkillBonus || 0;
  const equip = Number(actor.system.equipmentFlags?.skillBonuses?.[skillKey]) || 0;
  // Alternate Sight (bestial trait) + racial Perception bonuses (Part Beast, Lock-On, …)
  const bestial = skillKey === "perception"
    ? (Number(actor.system._bestialPerceptionBonus) || 0)
      + (Number(actor.system.aptitudes?.perceptionBonus) || 0) : 0;
  // Cloaking System (cybernetic trait): +1 Stealth Dice Score
  const cyber = skillKey === "stealth"
    ? (Number(actor.system._cyberStealthBonus) || 0) : 0;
  return Math.floor(attrScore / 2) + (Number(rank) || 0) * 2 + gs + equip + bestial + cyber;
}

async function responderRoll(actor, choice) {
  const sheet = actor.sheet;
  const cts = sheet._calcCombatCTs(actor.system);
  if (choice === "might") {
    return evalClashRoll(actor, fallbackFormula(actor, "might"), 10);
  }
  if (["strike", "dodge"].includes(choice)) {
    let formula = fallbackFormula(actor, choice);
    try {
      const prep = await sheet.getData();
      const ref = (prep.attackRefs || [])[0];
      if (choice === "strike" && ref?.strikeFormula) formula = ref.strikeFormula;
      if (choice === "dodge" && ref?.dodgeFormula) formula = ref.dodgeFormula;
    } catch (e) { /* fallback stays */ }
    return evalClashRoll(actor, formula, choice === "dodge" ? cts.dodgeCT : cts.strikeCT);
  }
  // Skill Clash response (Terrify: Intuition/Intimidation; Feint: Intuition/Perception)
  return evalClashRoll(actor, `1d10+${computeSkillBonus(actor, choice)}`, 10);
}

/** Outcome text per clash type/option. initiatorWins: ties already resolved (defender wins). */
function clashOutcome(type, option, initiatorWins, ctx) {
  if (type === "grapple") {
    const map = {
      init: initiatorWins
        ? `<b>GRAPPLE ESTABLISHED.</b> Both characters suffer Guard Down (cannot remove while grappled). Grappler may end it as an Instant Maneuver; the Grappled re-checks at the start of their turns.`
        : `Initiator loses — they <b>provoke the Exploit Maneuver</b> from the target.`,
      tail: initiatorWins
        ? `<b>GRAPPLE + TAIL RESTRAINED.</b> Target cannot use the Tail Attack Maneuver while in this Grapple. Both suffer Guard Down.`
        : `Initiator loses — they <b>provoke the Exploit Maneuver</b> from the target.`,
      escape: initiatorWins
        ? `<b>ESCAPED the Grapple!</b>`
        : `Escape failed — still Grappled.`,
      pulledIn: initiatorWins
        ? `<b>PULLED IN.</b> Move the Grappled to the closest unoccupied adjacent Square.`
        : `Pull failed — no effect.`,
      launch: initiatorWins
        ? `<b>LAUNCH!</b> End the Grapple and move the target up to <b>${ctx.might}</b> Squares (your Might) in any direction.`
        : `Launch failed — <b>the Grappled escapes the Grapple.</b>`
    };
    return map[option] || "";
  }
  if (type === "thrust") {
    return initiatorWins
      ? "" // follow-up buttons shown instead
      : `Thrust failed — no effect.`;
  }
  if (type === "terrify") {
    return initiatorWins ? "" /* custom section with condition buttons */ : `Terrify failed — no effect.`;
  }
  if (type === "feint") {
    return initiatorWins
      ? `<b>FEINT!</b> The Attacking Maneuver is canceled and the Action Cost regained (the 2(T) KP stays spent). ${esc(ctx.initName)}'s next Basic Attack (no AoE) against the target THIS TURN gains <b>+${ctx.tier} Strike</b> and <b>+${ctx.initAttackCost || 0} Wound</b> (the initial attack's KP cost). The target CANNOT use the Defend Maneuver against it, but you cannot Ki Wager on it or apply Energy Charges.`
      : `Feint failed — the Attacking Maneuver proceeds as declared.`;
  }
  if (type === "dirtyTrick") {
    return initiatorWins ? "" /* effect buttons shown instead */ : `Dirty Trick failed — no effect.`;
  }
  return "";
}

export async function initiateClash(actor, opts) {
  const clashId = foundry.utils.randomID(10);
  const rolled = await evalClashRoll(actor, opts.formula, opts.ct);
  await actor.setFlag(SYS, `clashes.${clashId}`, {
    role: "initiator",
    type: opts.type,
    option: opts.option || "",
    label: opts.label || opts.type,
    note: opts.note || "",
    extra: opts.extra || {},
    ...rolled
  });
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="dbu-clash-shell" data-clash-id="${clashId}"></div>`,
    flags: {
      [SYS]: {
        clash: {
          clashId,
          initiatorId: actor.id,
          responderKind: opts.responderKind || "strike-or-dodge",
          responderSkills: opts.responderSkills || null
        }
      }
    }
  });
  try { foundry.audio.AudioHelper.play({ src: CONFIG.sounds.dice }, true); } catch (e) { /* no-op */ }
}

function findClashResponder(clashId, initiatorId) {
  return game.actors.find(a =>
    a.id !== initiatorId && a.getFlag(SYS, `clashes.${clashId}`)?.role === "responder"
  ) || null;
}

function clashRollLine(label, r) {
  const tag = r.crit
    ? ` <span class="dbu-crit">CRIT +${r.critTotal}</span>`
    : (r.botch ? ` <span class="dbu-botch">BOTCH</span>` : "");
  return `<div class="dbu-roll-row">
    <span class="dbu-roll-label">${esc(label)}</span>
    <span class="dbu-roll-main">
      <code class="dbu-roll-formula">${esc(r.formula)}</code>
      <span class="dbu-roll-sub">Nat ${r.nat} · CT ${r.ct}+</span>${tag}
    </span>
    <span class="dbu-roll-total">${r.total}</span>
  </div>`;
}

function onRenderClashMessage(message, html) {
  const meta = message.getFlag(SYS, "clash");
  if (!meta) return;
  const $html = html instanceof HTMLElement ? $(html) : html;
  const shell = $html.find(".dbu-clash-shell")[0];
  if (!shell) return;
  const init = game.actors.get(meta.initiatorId);
  const initSt = init?.getFlag(SYS, `clashes.${meta.clashId}`);
  if (!init || !initSt) return;
  const resp = findClashResponder(meta.clashId, meta.initiatorId);
  const respSt = resp ? resp.getFlag(SYS, `clashes.${meta.clashId}`) : null;

  const header = `<h3 class="dbu-attack-title"><span class="dbu-card-title-text"><i class="fas fa-fist-raised"></i> ${esc(initSt.label)} — ${esc(init.name)}${resp ? ` vs ${esc(resp.name)}` : ""}</span></h3>`;
  const noteHtml = initSt.note ? `<div class="dbu-defend-desc">${initSt.note}</div>` : "";
  let body = `${noteHtml}${clashRollLine(init.name, initSt)}`;

  const skillName = (id) =>
    (CONFIG.DBU?.skillsData || []).find(s => s.id === id)?.name
    || id.charAt(0).toUpperCase() + id.slice(1);
  if (!respSt) {
    const respLabel = meta.responderKind === "might"
      ? "Respond (Might Clash)"
      : (meta.responderKind === "skill" && Array.isArray(meta.responderSkills)
        ? `Respond (${meta.responderSkills.map(skillName).join(" / ")})`
        : "Respond (Strike / Dodge)");
    body += `<div class="dbu-attack-actions">
      <button type="button" class="dbu-pay-btn dbu-clash-respond"><i class="fas fa-shield-alt"></i> ${respLabel}</button>
    </div>`;
  } else {
    body += clashRollLine(`${resp.name} (${skillName(respSt.choice)})`, respSt);
    // Defender wins ties (core-rules.txt:14)
    const initiatorWins = initSt.total > respSt.total;
    const outcome = clashOutcome(initSt.type, initSt.option, initiatorWins, {
      might: init.system.status?.mightForClashes ?? init.system.status?.might ?? 0,
      tier: init.system.tier || 1,
      initName: init.name,
      initAttackCost: Number(initSt.extra?.initAttackCost) || 0
    });
    body += `<div class="dbu-duel-outcome"><span class="dbu-duel-winner${initiatorWins ? "" : " tie"}">${initiatorWins ? esc(init.name) : esc(resp.name)} WINS ${initSt.total}–${respSt.total}</span></div>`;
    if (outcome) body += `<div class="dbu-defend-guide">${outcome}</div>`;

    // Dirty Trick: winner picks one of the three effects
    if (initSt.type === "dirtyTrick" && initiatorWins && !initSt.followUp) {
      body += `<div class="dbu-attack-actions">
        <button type="button" class="dbu-pay-btn dbu-dt-effect" data-effect="sand"><i class="fas fa-hand-sparkles"></i> Pocket Sand</button>
        <button type="button" class="dbu-pay-btn dbu-dt-effect" data-effect="look"><i class="fas fa-eye"></i> Made ya look!</button>
        <button type="button" class="dbu-pay-btn dbu-dt-effect" data-effect="tragedy" title="[1/Encounter]"><i class="fas fa-sad-tear"></i> It's Such a Tragedy!</button>
      </div>`;
    }
    if (initSt.type === "dirtyTrick" && initSt.followUp) {
      const f = initSt.followUp;
      const rider = (initSt.crit || respSt.botch);
      const dtMap = {
        sand: {
          cond: "blinded",
          text: `<b>POCKET SAND!</b> ${esc(resp.name)} is <b>Blinded</b> until the end of ${esc(init.name)}'s turn.`
        },
        look: {
          cond: "guardDown",
          text: `<b>MADE YA LOOK!</b> ${esc(resp.name)} gains <b>Guard Down</b> until the end of ${esc(init.name)}'s turn or until hit by an Attacking Maneuver (whichever comes first).`
        },
        tragedy: {
          cond: "compelled",
          text: `<b>IT'S SUCH A TRAGEDY!</b> [1/Encounter] ${esc(resp.name)} is <b>Compelled</b> until the end of their turn against a target of ${esc(init.name)}'s choice.` +
            (rider ? `<br><b>Crit/Botch rider:</b> they MUST use the Transformation or Power Up Maneuver during their next turn.` : "")
        }
      };
      const d = dtMap[f.choice];
      if (d) {
        body += `<div class="dbu-defend-guide">${d.text}</div>
          <div class="dbu-attack-actions"><button type="button" class="dbu-pay-btn dbu-clash-apply-cond" data-cond="${d.cond}" data-target-id="${resp.id}"><i class="fas fa-magic"></i> Apply ${d.cond === "guardDown" ? "Guard Down" : d.cond.charAt(0).toUpperCase() + d.cond.slice(1)} to ${esc(resp.name)}</button></div>`;
      }
    }

    // Terrify: Shaken — or Prone if the target was ALREADY Shaken
    if (initSt.type === "terrify" && initiatorWins) {
      const alreadyShaken = (resp.system.conditions || []).some(c => c.id === "shaken" && c.active);
      body += alreadyShaken
        ? `<div class="dbu-defend-guide"><b>${esc(resp.name)} was already Shaken — KNOCKED PRONE!</b></div>
           <div class="dbu-attack-actions"><button type="button" class="dbu-pay-btn dbu-clash-apply-cond" data-cond="prone" data-target-id="${resp.id}"><i class="fas fa-arrow-down"></i> Apply Prone to ${esc(resp.name)}</button></div>`
        : `<div class="dbu-defend-guide"><b>${esc(resp.name)} is SHAKEN</b> until the end of ${esc(init.name)}'s next turn (−2(T) Strike Rolls).</div>
           <div class="dbu-attack-actions"><button type="button" class="dbu-pay-btn dbu-clash-apply-cond" data-cond="shaken" data-target-id="${resp.id}"><i class="fas fa-ghost"></i> Apply Shaken to ${esc(resp.name)}</button></div>`;
    }

    // Thrust follow-up: winner picks Push Back or Knock Prone (Might Clash)
    if (initSt.type === "thrust" && initiatorWins && !initSt.followUp) {
      const might = init.system.status?.mightForClashes ?? init.system.status?.might ?? 0;
      body += `<div class="dbu-attack-actions">
        <button type="button" class="dbu-pay-btn dbu-thrust-push" data-might="${might}"><i class="fas fa-arrows-alt-h"></i> Push Back (${Math.floor(might / 2)} sq)</button>
        <button type="button" class="dbu-pay-btn dbu-thrust-prone"><i class="fas fa-arrow-down"></i> Knock Prone (Might Clash)</button>
      </div>`;
    }
    if (initSt.type === "thrust" && initSt.followUp) {
      const f = initSt.followUp;
      if (f.choice === "push") {
        body += `<div class="dbu-defend-guide"><b>PUSH BACK:</b> target moves <b>${f.squares}</b> Squares in a straight line away. Double any Collision Damage; −1(bT) to their Acrobatics/Clash to avoid Collision.</div>`;
      } else {
        body += clashRollLine(`${init.name} Might`, f.mightInit) + clashRollLine(`${resp.name} Might`, f.mightResp);
        // Defender wins ties in the Might Clash too
        const proneWin = f.mightInit.total > f.mightResp.total;
        body += proneWin
          ? `<div class="dbu-defend-guide"><b>KNOCKED PRONE!</b> ${esc(resp.name)} is Prone (Speed/DV/Haste halved, +1 Damage Category received; 1 Action to stand).</div>
             <div class="dbu-attack-actions"><button type="button" class="dbu-pay-btn dbu-clash-apply-prone" data-target-id="${resp.id}"><i class="fas fa-arrow-down"></i> Apply Prone to ${esc(resp.name)}</button></div>`
          : `<div class="dbu-defend-guide">Might Clash lost — ${esc(resp.name)} gains <b>Guard Down</b> vs the next Attacking Maneuver targeting them, or until the end of ${esc(init.name)}'s next turn.</div>`;
      }
    }
  }

  shell.innerHTML = `${header}<div class="dbu-card-body">${body}</div>`;
  shell.classList.add("dbu-attack-roll", "dbu-clash-card");

  // ---- Wiring ----
  shell.querySelectorAll(".dbu-clash-respond").forEach(btn => {
    btn.addEventListener("click", async () => {
      const owned = game.actors.filter(a => a.type === "character" && a.isOwner && a.id !== meta.initiatorId);
      if (!owned.length) return ui.notifications.warn("You own no eligible character to respond.");
      let actor = owned.length === 1 ? owned[0] : (game.user.character?.id !== meta.initiatorId ? game.user.character : null);
      if (!actor) {
        const choice = await Dialog.wait({
          title: "Respond — choose your character",
          content: `<select id="dbu-clash-pick" style="width:100%">${owned.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join("")}</select>`,
          buttons: {
            ok: { label: "Choose", callback: (h) => h.find("#dbu-clash-pick").val() },
            cancel: { label: "Cancel", callback: () => null }
          },
          close: () => null
        });
        if (!choice) return;
        actor = game.actors.get(choice);
      }
      let rollChoice = "might";
      if (meta.responderKind === "skill" && Array.isArray(meta.responderSkills) && meta.responderSkills.length === 1) {
        rollChoice = meta.responderSkills[0];
      } else if (meta.responderKind === "skill" && Array.isArray(meta.responderSkills)) {
        const skillButtons = {};
        for (const s of meta.responderSkills) {
          skillButtons[s] = {
            label: `${skillName(s)} (+${computeSkillBonus(actor, s)})`,
            callback: () => s
          };
        }
        skillButtons.cancel = { label: "Cancel", callback: () => null };
        rollChoice = await Dialog.wait({
          title: `${actor.name} — respond with which Skill?`,
          content: `<p style="font-size:0.85em">Skill Clash — choose your responding Skill.</p>`,
          buttons: skillButtons,
          close: () => null
        });
        if (!rollChoice) return;
      } else if (meta.responderKind !== "might") {
        rollChoice = await Dialog.wait({
          title: `${actor.name} — respond with?`,
          content: `<p style="font-size:0.85em">Choose your roll for the Clash (Strike vs <b>Strike/Dodge</b>).</p>`,
          buttons: {
            strike: { label: "Strike", callback: () => "strike" },
            dodge: { label: "Dodge", callback: () => "dodge" },
            cancel: { label: "Cancel", callback: () => null }
          },
          close: () => null
        });
        if (!rollChoice) return;
      }
      const rolled = await responderRoll(actor, rollChoice);
      await actor.setFlag(SYS, `clashes.${meta.clashId}`, {
        role: "responder", choice: rollChoice, ...rolled
      });
      try { foundry.audio.AudioHelper.play({ src: CONFIG.sounds.dice }, true); } catch (e) { /* no-op */ }
    });
  });

  shell.querySelectorAll(".dbu-dt-effect").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!init.isOwner) return ui.notifications.warn("Only the winner (or GM) chooses the effect.");
      await setClashState(init, meta.clashId, { followUp: { choice: btn.dataset.effect } });
    });
  });

  shell.querySelectorAll(".dbu-thrust-push").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!init.isOwner) return ui.notifications.warn("Only the winner (or GM) chooses the effect.");
      const might = Number(btn.dataset.might) || 0;
      await setClashState(init, meta.clashId, { followUp: { choice: "push", squares: Math.floor(might / 2) } });
    });
  });

  shell.querySelectorAll(".dbu-thrust-prone").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!init.isOwner) return ui.notifications.warn("Only the winner (or GM) chooses the effect.");
      if (!resp) return;
      const mightInit = await evalClashRoll(init, fallbackFormula(init, "might"), 10);
      const mightResp = await evalClashRoll(resp, fallbackFormula(resp, "might"), 10);
      await setClashState(init, meta.clashId, { followUp: { choice: "prone", mightInit, mightResp } });
      try { foundry.audio.AudioHelper.play({ src: CONFIG.sounds.dice }, true); } catch (e) { /* no-op */ }
    });
  });

  shell.querySelectorAll(".dbu-clash-apply-prone, .dbu-clash-apply-cond").forEach(btn => {
    btn.addEventListener("click", async () => {
      const target = game.actors.get(btn.dataset.targetId);
      const condId = btn.dataset.cond || "prone";
      if (!target?.isOwner) return ui.notifications.warn("Only the target's owner (or GM) applies the condition.");
      const conditions = foundry.utils.deepClone(target.system.conditions || []);
      const cond = conditions.find(c => c.id === condId);
      if (cond) cond.active = true;
      else conditions.push({ id: condId, active: true, stacks: 0 });
      await target.update({ "system.conditions": conditions });
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-check"></i> ${condId.charAt(0).toUpperCase() + condId.slice(1)} applied`;
    });
  });
}

async function setClashState(actor, clashId, patch) {
  const cur = actor.getFlag(SYS, `clashes.${clashId}`) || {};
  return actor.setFlag(SYS, `clashes.${clashId}`, foundry.utils.mergeObject(cur, patch, { inplace: false }));
}

function onClashActorUpdate(actor, changes) {
  const clashes = foundry.utils.getProperty(changes, `flags.${SYS}.clashes`);
  if (!clashes) return;
  const ids = Object.keys(clashes).map(k => k.replace(/^-=/, ""));
  for (const msg of game.messages.contents.slice(-50)) {
    const meta = msg.getFlag(SYS, "clash");
    if (meta && ids.includes(meta.clashId)) ui.chat.updateMessage(msg);
  }
}

export function registerDuelHooks() {
  Hooks.on("renderChatMessage", onRenderDuelMessage);
  Hooks.on("renderChatMessage", onRenderUnitedAttack);
  Hooks.on("renderChatMessage", onRenderClashMessage);
  Hooks.on("updateActor", onDuelActorUpdate);
  Hooks.on("updateActor", onClashActorUpdate);
}
