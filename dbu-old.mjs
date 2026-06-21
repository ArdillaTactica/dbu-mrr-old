/**
 * DBU-OLD — Dragon Ball Universe RPG System for Foundry VTT
 * Main entry point.
 */

// Document classes
import { DBUActor } from "./module/documents/actor.mjs";
import { DBUItem } from "./module/documents/item.mjs";
import { DBUCombat } from "./module/documents/combat.mjs";

// TypeDataModels
import DBUCharacterData from "./module/data-models/character.mjs";
import DBUTechniqueData from "./module/data-models/items/technique.mjs";
import DBUAuraData from "./module/data-models/items/aura.mjs";
import DBUTraitData from "./module/data-models/items/trait.mjs";
import DBUTalentData from "./module/data-models/items/talent.mjs";
import DBUUniqueAbilityData from "./module/data-models/items/unique-ability.mjs";
import DBUTransformationData from "./module/data-models/items/transformation.mjs";
import DBUEquipmentData from "./module/data-models/items/equipment.mjs";

// Sheet classes
import { DBUCharacterSheet } from "./module/sheets/character-sheet.mjs";
import { DBUItemSheet } from "./module/sheets/item-sheet.mjs";

// Helpers
import { preloadHandlebarsTemplates } from "./module/helpers/templates.mjs";
import { registerHandlebarsHelpers } from "./module/helpers/handlebars-helpers.mjs";
import { registerConfig } from "./module/helpers/config.mjs";

// Data catalogs
import { ALL_RACIAL_TRAITS } from "./module/data/racial-traits-catalog.mjs";
import { TALENT_CATEGORIES, ALL_TALENTS_DATA } from "./module/data/talents-catalog.mjs";
import { UNIQUE_ABILITIES_DATA } from "./module/data/unique-abilities-catalog.mjs";
import { TRANSFORMATIONS_CATALOG } from "./module/data/transformations-catalog.mjs";
import { VILLAINOUS_TRAITS_CATALOG } from "./module/data/villainous-traits-catalog.mjs";
import { WEAKNESSES_CATALOG } from "./module/data/weaknesses-catalog.mjs";
import { MINION_TRAITS_CATALOG } from "./module/data/minion-traits-catalog.mjs";
import { MASTERY_EFFECTS_CATALOG } from "./module/data/mastery-effects-catalog.mjs";
import { BESTIAL_TRAITS_CATALOG } from "./module/data/bestial-traits-catalog.mjs";
import { APPAREL_QUALITIES_CATALOG } from "./module/data/apparel-qualities-catalog.mjs";
import { WEAPON_QUALITIES_CATALOG } from "./module/data/weapon-qualities-catalog.mjs";
import { EVIL_AURA_TECHNIQUES } from "./module/data/evil-aura-techniques-catalog.mjs";

// Battle Jacket
import DBUBattleJacketData from "./module/data-models/battle-jacket.mjs";
import { DBUBattleJacketSheet } from "./module/sheets/battle-jacket-sheet.mjs";
import { JACKET_MODULES_CATALOG } from "./module/data/jacket-modules-catalog.mjs";

// =============================================================
// Hooks
// =============================================================

/**
 * Init Hook — runs once when the system is first initialized.
 * Registers document classes, sheets, templates, and helpers.
 */
Hooks.once("init", () => {
  console.log("DBU-OLD | Initializing Dragon Ball Universe RPG system");

  // Namespace for system-level references
  game.dbu = game.dbu ?? {};

  // Register system configuration
  registerConfig();

  // Attach data catalogs to CONFIG
  CONFIG.DBU.racialTraitsCatalog = ALL_RACIAL_TRAITS;
  CONFIG.DBU.talentsCatalog = ALL_TALENTS_DATA;
  CONFIG.DBU.talentCategories = TALENT_CATEGORIES;
  CONFIG.DBU.uniqueAbilitiesCatalog = UNIQUE_ABILITIES_DATA;
  CONFIG.DBU.transformationsCatalog = TRANSFORMATIONS_CATALOG;
  CONFIG.DBU.villainousTraitsCatalog = VILLAINOUS_TRAITS_CATALOG;
  CONFIG.DBU.weaknessesCatalog = WEAKNESSES_CATALOG;
  CONFIG.DBU.minionTraitsCatalog = MINION_TRAITS_CATALOG;
  CONFIG.DBU.masteryEffectsCatalog = MASTERY_EFFECTS_CATALOG;
  CONFIG.DBU.jacketModulesCatalog = JACKET_MODULES_CATALOG;
  CONFIG.DBU.bestialTraitsCatalog = BESTIAL_TRAITS_CATALOG;
  CONFIG.DBU.apparelQualities = Object.fromEntries(APPAREL_QUALITIES_CATALOG.map(q => [q.id, q]));
  CONFIG.DBU.weaponQualities  = Object.fromEntries(WEAPON_QUALITIES_CATALOG.map(q => [q.id, q]));
  CONFIG.DBU.evilAuraTechniques = EVIL_AURA_TECHNIQUES;

  // Set custom document classes
  CONFIG.Actor.documentClass = DBUActor;
  CONFIG.Item.documentClass = DBUItem;

  // Set custom Combat document class
  CONFIG.Combat.documentClass = DBUCombat;

  // Initiative formula (fields from actor getRollData)
  CONFIG.Combat.initiative = {
    formula: "1d10 + @aptitudes.initiative + @aptitudes.initiativeRollBonus",
    decimals: 0
  };

  // Register Initiative Advantage hooks
  DBUCombat.registerHooks();

  // Register TypeDataModels
  CONFIG.Actor.dataModels = {
    character: DBUCharacterData,
    battleJacket: DBUBattleJacketData
  };
  CONFIG.Item.dataModels = {
    technique: DBUTechniqueData,
    transformation: DBUTransformationData,
    talent: DBUTalentData,
    racialTrait: DBUTraitData,
    aura: DBUAuraData,
    uniqueAbility: DBUUniqueAbilityData,
    equipment: DBUEquipmentData
  };

  // Register actor sheets
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("DBU-MRR-OLD", DBUCharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "DBU.SheetLabel.Character"
  });

  Actors.registerSheet("DBU-MRR-OLD", DBUBattleJacketSheet, {
    types: ["battleJacket"],
    makeDefault: true,
    label: "DBU.SheetLabel.BattleJacket"
  });

  // Register item sheets
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("DBU-MRR-OLD", DBUItemSheet, {
    makeDefault: true,
    label: "DBU.SheetLabel.Item"
  });

  // Preload Handlebars templates
  preloadHandlebarsTemplates();

  // Register custom Handlebars helpers
  registerHandlebarsHelpers();

  console.log("DBU-OLD | System initialized");
});

/**
 * Ready Hook — runs once after all game data is loaded.
 */
Hooks.once("ready", () => {
  console.log("DBU-OLD | System ready");
});

/**
 * Chat-message click handler for attack-roll Pay buttons.
 *
 * Buttons are injected by the tracker "Roll Attack" feature with:
 *   data-dbu-pay="ki-cost" | "ki-wager"
 *   data-actor-id=<actor id>
 *   data-amount=<KP to deduct>
 *
 * Payments are SERIALIZED per actor through a Promise queue so that fast
 * back-to-back clicks (Pay Cost then Pay Wager) don't race on the same KP
 * value and silently overwrite each other.
 */
const _DBU_PAY_QUEUES = new Map();
function _dbuQueuePayment(actorId, work) {
  const prev = _DBU_PAY_QUEUES.get(actorId) || Promise.resolve();
  const next = prev.then(work, work);  // run even if previous rejected
  _DBU_PAY_QUEUES.set(actorId, next.catch(() => {}));
  return next;
}

Hooks.on("renderChatMessage", (message, html, data) => {
  const $html = html instanceof HTMLElement ? $(html) : html;
  $html.find("[data-dbu-pay]").each((_, btn) => {
    btn.addEventListener("click", async (ev) => {
      ev.preventDefault();
      if (btn.disabled) return;
      const actorId = btn.dataset.actorId;
      const actor = game.actors.get(actorId);
      if (!actor) return ui.notifications.error("Actor not found.");
      if (!actor.isOwner && !game.user.isGM) {
        return ui.notifications.warn("You don't own this actor.");
      }
      const amount = Math.max(0, Number(btn.dataset.amount) || 0);
      if (amount <= 0) {
        btn.disabled = true;
        return;
      }
      // Disable button IMMEDIATELY (before await) to prevent the same button
      // being clicked twice while its own update is in-flight.
      btn.disabled = true;
      btn.classList.add("dbu-pay-pending");
      const kind = btn.dataset.dbuPay === "ki-wager" ? "Wager" : "Cost";

      await _dbuQueuePayment(actorId, async () => {
        // Re-read ki AT THE MOMENT this queued payment runs so we always see
        // the post-previous-payment value (prevents the race that lets one
        // payment overwrite another).
        const ki = actor.system.kiPool?.value ?? 0;
        const shortBy = amount - ki;
        const newKi = Math.max(0, ki - amount);
        await actor.update({ "system.kiPool.value": newKi });
        btn.classList.remove("dbu-pay-pending");
        if (shortBy > 0) {
          btn.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Short by ${shortBy} KP — paid ${ki}`;
          btn.classList.add("dbu-pay-paid", "dbu-pay-short");
          ui.notifications.warn(`${actor.name}: insufficient KP. Paid ${ki}/${amount} ${kind}. Short by ${shortBy} KP.`);
        } else {
          btn.innerHTML = `<i class="fas fa-check"></i> Paid ${kind}: ${amount} KP`;
          btn.classList.add("dbu-pay-paid");
          ui.notifications.info(`${actor.name}: -${amount} KP (${kind}). Remaining: ${newKi}`);
        }
      });
    });
  });
});
