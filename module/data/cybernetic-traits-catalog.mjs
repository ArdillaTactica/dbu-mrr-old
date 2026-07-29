// Cybernetic Traits catalog for the DBU system
// Source: https://dbu-rpg.com/cybernetic-enhancement/
// Total traits: 12. Z = stacks of Cybernetic Enhancement.
// `attribute` is the bracketed Attribute — each chosen trait adds +1 AMB to it
// (mental_supercomputer lets the player choose SC or PE via attributeChoice).

export const CYBERNETIC_TRAITS_CATALOG = [
  {
    id: "cyber_cloaking_system",
    name: "Cloaking System",
    attribute: "ag",
    description: "You have the ability to make yourself invisible to the naked eye.",
    effects: [
      { activationType: "passive", keyword: "Stealth Boost", text: "Increase the Dice Score of your Stealth Skill Checks by 1." },
      { activationType: "passive", keyword: "Camouflage", text: "You gain the Camouflage Bestial Trait." }
    ]
  },
  {
    id: "cyber_rocket_sleeves",
    name: "Rocket Sleeves",
    attribute: "ag",
    description: "You have the ability to move faster and farther while expending less energy.",
    effects: [
      { activationType: "passive", keyword: "Free Boost", text: "You do not pay any Ki Points when you exceed your Normal Speed through the Movement Maneuver." },
      { activationType: "limited", keyword: "Triggered, 1/Round", usageLimit: "round", maxUses: 1, text: "If you use the Movement Maneuver to move a number of Squares up to your Boosted Speed, increase your Wound Rolls by 3(T) until the end of your turn." }
    ]
  },
  {
    id: "cyber_emergency_energy",
    name: "Emergency Energy Supplies",
    attribute: "fo",
    description: "Your battery backup makes it easier for you to recover your stamina and stay in the fight.",
    effects: [
      { activationType: "passive", keyword: "Surge Boost", text: "Increase Life and Ki Points regained through a Surge by 3(bT)." },
      { activationType: "limited", keyword: "1/Encounter", usageLimit: "encounter", maxUses: 1, text: "Spend an Action to use a Power Surge." }
    ]
  },
  {
    id: "cyber_signature_amplifier",
    name: "Signature Amplifier",
    attribute: "fo",
    description: "Your attacks are imbued with extra force thanks to your machine upgrades.",
    effects: [
      { activationType: "passive", keyword: "Ultimate Power Shot", text: "All of your Ultimate Signature Techniques of the Physical or Energy Attack Type gain a rank of Power Shot." },
      { activationType: "limited", keyword: "Triggered, 1/Round", usageLimit: "round", maxUses: 1, text: "If you use the Signature Technique Maneuver to use a Signature Technique of the Physical or Energy Attack Type, you may spend up to 3(T) Ki Points to increase the Wound Roll by twice the amount of Ki Points you spent." }
    ]
  },
  {
    id: "cyber_synthetic_muscle",
    name: "Synthetic Muscle",
    attribute: "fo",
    description: "Replacing your organic muscles with artificial ones, you've enhanced your strength significantly.",
    effects: [
      { activationType: "passive", keyword: "Enhanced Strength", text: "Increase your Soak Value and Wound Rolls of your Physical/Energy Attacks by 1(T) and 1d4(T) respectively." },
      { activationType: "passive", keyword: "No Super Stacks", text: "You cannot possess any number of Super Stacks." }
    ]
  },
  {
    id: "cyber_armor_plating",
    name: "Armor Plating",
    attribute: "te",
    description: "Your skin has been reinforced against damage, allowing you to withstand stronger hits.",
    effects: [
      { activationType: "passive", keyword: "Standard DR", text: "Gain 2(bT) Damage Reduction against Attacking Maneuvers that deal Standard Damage." },
      { activationType: "limited", keyword: "Triggered, 3/Encounter", usageLimit: "encounter", maxUses: 3, text: "If you are hit by an Attacking Maneuver, reduce the Damage Category of that Attacking Maneuver by 1." }
    ]
  },
  {
    id: "cyber_life_support",
    name: "Life Support",
    attribute: "te",
    description: "Your body is kept alive by machinery, rendering you far more durable than before.",
    effects: [
      { activationType: "passive", keyword: "Unnatural", text: "You become Unnatural." },
      { activationType: "passive", keyword: "Durability", text: "Increase your Damage Reduction by Z(bT) and increase your Racial Life Modifier by Z (this effect applies retroactively)." }
    ]
  },
  {
    id: "cyber_nanomachine_repair",
    name: "Nanomachine Repair",
    attribute: "te",
    description: "With nanites in your bloodstream constantly working to heal your wounds, you regenerate at an astonishing rate.",
    effects: [
      { activationType: "automatic", keyword: "Triggered/Start of Combat Round", text: "Regain 2(bT) Life Points. Increase this amount by 1(bT) for every Health Threshold you are below. This effect may occur even if you are Defeated." },
      { activationType: "triggered", keyword: "Triggered/Defeated", text: "Reduce your Ki Points by 1/2. When the Initiative Order comes to your next turn, regain Life Points equal to the Ki Points lost and stop being Defeated (if you are still Defeated)." }
    ]
  },
  {
    id: "cyber_integrated_weapon",
    name: "Integrated Weapon",
    attribute: "in",
    description: "A powerful weapon has been included in your cybernetic augmentations.",
    effects: [
      { activationType: "passive", keyword: "Weapon Creation", text: "When you gain this Trait, create a Weapon with 3 Qualities and Integrate it." },
      { activationType: "passive", keyword: "Integrated Wound", text: "Increase the Wound Rolls of any Attacking Maneuvers made with an Integrated Weapon by Z(T)." }
    ]
  },
  {
    id: "cyber_robotic_limb",
    name: "Robotic Limb",
    attribute: "in",
    description: "An extra limb has been added to your body beyond that of your original anatomy, and you have the ability to use it in battle.",
    effects: [
      { activationType: "passive", keyword: "Parry Boost", text: "Increase your Strike Rolls when using the Parry effect of the Defend Maneuver by 1(T)." },
      { activationType: "passive", keyword: "Tail Attack", text: "Gain access to the Tail Attack Maneuver." }
    ]
  },
  {
    id: "cyber_onboard_computer",
    name: "Onboard Computer",
    attribute: "in",
    description: "You have the ability to track targets with the computer built into your augments.",
    effects: [
      { activationType: "passive", keyword: "Scouter", text: "Integrate a Scouter with a Craft DC of Master." },
      { activationType: "limited", keyword: "Triggered/Start of Combat Round", usageLimit: "round", maxUses: 1, text: "Target an Opponent. Increase either your Strike or Dodge Rolls against them by 2(T) for the duration of this Combat Round." }
    ]
  },
  {
    id: "cyber_mental_supercomputer",
    name: "Mental Supercomputer",
    attribute: "sc",
    attributeChoice: ["sc", "pe"],
    description: "Your inbuilt hardware is capable of running calculations at speeds well above and beyond your natural capabilities.",
    effects: [
      { activationType: "limited", keyword: "Triggered, 1/Round", usageLimit: "round", maxUses: 1, text: "When you use the Analysis or Hype Maneuver, increase the Strike and Wound Rolls of your next Attacking Maneuver by 1(T) and 2(T) respectively." },
      { activationType: "limited", keyword: "Triggered, 1/Round", usageLimit: "round", maxUses: 1, text: "When you use the Command Maneuver, each targeted Minion has their Combat Rolls increased by 1(T) for the duration of their turn." }
    ]
  }
];
