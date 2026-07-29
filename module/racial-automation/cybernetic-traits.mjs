/**
 * Cybernetic Enhancement (Manifested Power) trait automation.
 *
 * The player selects Cybernetic Traits (3 for the first stack, +2 per extra
 * stack, max 3 stacks) via the transformation traits dialog. Chosen traits are
 * stored in `system.transformationMeta.cyberneticState = { traits, config }`.
 *
 * Passive stat bonuses are applied here (called from actor.mjs right after
 * applyBestialTraitBonuses); conditional stores (`system._cyber*`) are consumed
 * at their roll/calc sites; triggered effects are pushed into
 * `manifestedPowerBonuses.entries` so they surface as combat activables with
 * automation descriptors (mp: trigger prefix).
 */

import { CYBERNETIC_TRAITS_CATALOG } from "../data/cybernetic-traits-catalog.mjs";

/** Active Cybernetic Enhancement transformation entry, or null. */
export function getActiveCyberneticEnhancement(system) {
  return (system.transformations || []).find(t => t?.active && t?.catalogKey === "cybernetic_enhancement") || null;
}

/** Stacks of the ACTIVE Cybernetic Enhancement (1..3), 0 if inactive. */
export function getCyberneticStacks(system) {
  const ce = getActiveCyberneticEnhancement(system);
  if (!ce) return 0;
  const parsed = parseInt(String(ce.gradeOrStacks ?? "").replace(/[^\d]/g, ""), 10);
  return Math.min(3, Math.max(1, parsed || 1));
}

/** Trait allowance: 3 for the first stack, +2 per additional stack. */
export function getCyberneticTraitLimit(stacks) {
  return stacks > 0 ? 3 + 2 * (stacks - 1) : 0;
}

/** Chosen trait ids, validated against the catalog and clamped to the allowance. */
export function getActiveCyberneticTraits(system) {
  const ce = getActiveCyberneticEnhancement(system);
  if (!ce) return [];
  const state = system.transformationMeta?.cyberneticState || {};
  const chosen = Array.isArray(state.traits) ? state.traits : [];
  const valid = new Set(CYBERNETIC_TRAITS_CATALOG.map(t => t.id));
  const limit = getCyberneticTraitLimit(getCyberneticStacks(system));
  return chosen.filter(id => valid.has(id)).slice(0, limit);
}

/**
 * Scientific Upgrade AMB rider: +1 to the listed Attribute of each chosen
 * trait (Mental Supercomputer: SC or PE, player's choice). Consumed inside
 * _calculateAttributeModifiers while processing the CE transformation.
 */
export function getCyberneticAttrBonus(system, key) {
  const traits = getActiveCyberneticTraits(system);
  if (!traits.length) return 0;
  const cfg = system.transformationMeta?.cyberneticState?.config || {};
  let bonus = 0;
  for (const id of traits) {
    const def = CYBERNETIC_TRAITS_CATALOG.find(t => t.id === id);
    if (!def) continue;
    const attr = def.attributeChoice
      ? (def.attributeChoice.includes(cfg[id]?.attribute) ? cfg[id].attribute : def.attribute)
      : def.attribute;
    if (attr === key) bonus += 1;
  }
  return bonus;
}

/**
 * Apply passive bonuses + conditional stores. Runs late in the calc chain
 * (after combat stats / resources, before damage calc), same slot as bestial.
 */
export function applyCyberneticTraitBonuses(system, tier, baseTier) {
  const traits = getActiveCyberneticTraits(system);
  if (!traits.length) return;
  const level = system.level || 1;
  const stacks = getCyberneticStacks(system);
  system._activeCyberneticTraits = traits;
  system._cyberneticStacks = stacks;

  for (const id of traits) {
    switch (id) {
      case "cyber_cloaking_system":
        // +1 Stealth Dice Score (consumed in skill roll + skill clashes)
        system._cyberStealthBonus = (system._cyberStealthBonus || 0) + 1;
        break;
      case "cyber_synthetic_muscle":
        // +1(T) Soak; +1d4(T) Wound on Physical/Energy (consumed in wound prep)
        system.status.soak = (system.status.soak || 0) + tier;
        system._cyberSynthWoundDice = true;
        // "You cannot possess any number of Super Stacks."
        system.status.superStacks = 0;
        system._cyberNoSuperStacks = true;
        break;
      case "cyber_armor_plating":
        // 2(bT) DR vs Standard-damage attacks (consumed in damage calc)
        system._cyberStandardDR = (system._cyberStandardDR || 0) + 2 * baseTier;
        break;
      case "cyber_life_support":
        // +Z(bT) DR flat, +Z RLM → +Z×PL LP (retroactive)
        system.status.damageReduction = (system.status.damageReduction || 0) + stacks * baseTier;
        system.lifePoints.max = (system.lifePoints.max || 0) + stacks * level;
        break;
      case "cyber_robotic_limb":
        // +1(T) Strike on Parry (consumed in Defend/Parry roll)
        system._cyberParryStrike = (system._cyberParryStrike || 0) + tier;
        break;
      case "cyber_nanomachine_repair":
        // Start-of-round regen handled in _onCombatNewRound
        system._cyberNanomachineActive = true;
        break;
      case "cyber_integrated_weapon":
        // +Z(T) Wound with Integrated Weapons (conditional display)
        system._cyberIntegratedWound = stacks * tier;
        break;
      default:
        break;
    }
  }

  // Surface triggered effects of chosen traits as combat activables (mp: prefix)
  _pushTriggerEntries(system, traits, tier, baseTier);
}

function _pushTriggerEntries(system, traits, tier, baseTier) {
  const triggered = [];
  const has = (id) => traits.includes(id);

  if (has("cyber_rocket_sleeves")) {
    triggered.push({
      id: "cyber_rocket_boost", name: "Rocket Sleeves — Boost",
      description: `After moving up to your Boosted Speed with the Movement Maneuver: +${3 * tier} Wound Rolls until the end of your turn. (1/Round)`,
      usageLimit: "round", maxUses: 1,
      automation: { buffs: [{ stat: "wound", amount: 3 * tier, duration: "round" }] }
    });
  }
  if (has("cyber_emergency_energy")) {
    triggered.push({
      id: "cyber_emergency_surge", name: "Emergency Energy Supplies",
      description: "Spend an Action to use a Power Surge. (1/Encounter)",
      usageLimit: "encounter", maxUses: 1
    });
  }
  if (has("cyber_signature_amplifier")) {
    triggered.push({
      id: "cyber_signature_pump", name: "Signature Amplifier",
      description: `On a Physical/Energy Signature Technique: spend up to ${3 * tier} KP to increase the Wound Roll by twice the KP spent. (1/Round)`,
      usageLimit: "round", maxUses: 1,
      automation: { spendPrompt: { max: 3 * tier, label: "KP to amplify" }, buffs: [{ stat: "wound", amountFrom: "spent", ratio: 2, duration: "nextAttack" }] }
    });
  }
  if (has("cyber_armor_plating")) {
    triggered.push({
      id: "cyber_armor_reduce", name: "Armor Plating — Dampen",
      description: "If you are hit by an Attacking Maneuver, reduce its Damage Category by 1. (3/Encounter)",
      usageLimit: "encounter", maxUses: 3
    });
  }
  if (has("cyber_onboard_computer")) {
    triggered.push({
      id: "cyber_onboard_target", name: "Onboard Computer — Target Lock",
      description: `Start of Combat Round: target an Opponent; +${2 * tier} Strike OR Dodge Rolls against them this Combat Round. (1/Round)`,
      usageLimit: "round", maxUses: 1,
      automation: { choose: [
        { label: `+${2 * tier} Strike`, buffs: [{ stat: "strike", amount: 2 * tier, duration: "round" }] },
        { label: `+${2 * tier} Dodge`, buffs: [{ stat: "dodge", amount: 2 * tier, duration: "round" }] }
      ] }
    });
  }
  if (has("cyber_mental_supercomputer")) {
    triggered.push({
      id: "cyber_mental_focus", name: "Mental Supercomputer — Focus",
      description: `After Analysis or Hype: +${tier} Strike and +${2 * tier} Wound on your next Attacking Maneuver. (1/Round)`,
      usageLimit: "round", maxUses: 1,
      automation: { buffs: [
        { stat: "strike", amount: tier, duration: "nextAttack" },
        { stat: "wound", amount: 2 * tier, duration: "nextAttack" }
      ] }
    });
    triggered.push({
      id: "cyber_mental_command", name: "Mental Supercomputer — Command",
      description: `On Command Maneuver: each targeted Minion gains +${tier} Combat Rolls for their turn. (1/Round)`,
      usageLimit: "round", maxUses: 1
    });
  }
  if (has("cyber_nanomachine_repair")) {
    triggered.push({
      id: "cyber_nanomachine_defeated", name: "Nanomachine Repair — Reboot",
      description: "Triggered/Defeated: reduce your Ki Points by 1/2. On your next turn, regain Life Points equal to the Ki Points lost and stop being Defeated."
    });
  }
  if (has("cyber_cloaking_system")) {
    triggered.push({
      id: "cyber_cloak_invisible", name: "Cloaking System (Camouflage)",
      description: `Spend 1 Action and ${8 * baseTier} KP to enter the Invisible Special State (upkeep ${6 * baseTier} KP at start of turn). Exit as Instant. (1/Round)`,
      usageLimit: "round", maxUses: 1,
      automation: { cost: { kp: 8 * baseTier } }
    });
  }

  if (!triggered.length) return;
  if (!system.manifestedPowerBonuses) system.manifestedPowerBonuses = { entries: [], hasBonuses: false };
  if (!Array.isArray(system.manifestedPowerBonuses.entries)) system.manifestedPowerBonuses.entries = [];
  system.manifestedPowerBonuses.entries.push({
    name: "Cybernetic Enhancement",
    triggered,
    bonuses: [],
    conditionals: [],
    perRound: []
  });
  system.manifestedPowerBonuses.hasBonuses = true;
}
