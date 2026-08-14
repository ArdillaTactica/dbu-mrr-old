// Minion Traits catalog
// Standard traits (minions.txt) apply to any Minion; the two flagged
// `dangerousOnly` come from adversary-minions.txt (Dangerous Minions —
// players' Minions are discouraged from taking them).
// Total traits: 14 (12 standard + 2 dangerous)

export const MINION_TRAITS_CATALOG = [
  {
    "id": "mt_monstrous_00003",
    "name": "Monstrous",
    "standard": true,
    "stackable": true,
    "description": "This Minion's just a little different, possessing animalistic traits.",
    "effects": [
      { "activationType": "passive", "keyword": "Passive", "text": "Gain a Bestial Trait. You can gain this Minion Trait multiple times.", "usageLimit": null, "maxUses": 0 }
    ]
  },
  {
    "id": "mt_geared_up_00004",
    "name": "Geared Up",
    "standard": true,
    "description": "Armed with armor, weapons, and/or other equipment, this Minion is ready for adventure.",
    "effects": [
      { "activationType": "passive", "keyword": "Passive", "text": "During Minion Creation, this Minion gains the Weapon Specialist Talent and a Gear Kit (using the Master's base Tier of Power).", "usageLimit": null, "maxUses": 0 }
    ]
  },
  {
    "id": "mt_diff_scale_0005",
    "name": "Different Scale",
    "standard": true,
    "stackable": true,
    "hasOptions": true,
    "options": ["Massive Minion", "Minuscule Minion"],
    "description": "A bit smaller- or larger- than most, this Minion is in a whole different league.",
    "effects": [
      { "activationType": "option", "keyword": "Option", "text": "Choose an effect at Minion Creation; this Minion Trait can be chosen twice but you must choose the same Option again. Massive Minion [Passive]: Size Category becomes Enormous (Gigantic the second time). Minuscule Minion [Passive]: Size Category becomes Tiny (Nano the second time).", "usageLimit": null, "maxUses": 0 }
    ]
  },
  {
    "id": "mt_specialized_006",
    "name": "Specialized Minion",
    "standard": true,
    "stackable": true,
    "description": "Trained in a special technique, this Minion is a cut above the rest.",
    "effects": [
      { "activationType": "passive", "keyword": "Passive", "text": "This Minion gains a Signature Technique, Unique Ability or Aura with a TP Cost of up to 20 (Advancements within that 20 TP allowed). Can be chosen multiple times.", "usageLimit": null, "maxUses": 0 }
    ]
  },
  {
    "id": "mt_healthy_000007",
    "name": "Healthy Minion",
    "standard": true,
    "description": "More durable than others, this Minion's trained to be a damage sponge.",
    "effects": [
      { "activationType": "passive", "keyword": "Passive", "text": "Increase this Minion's Life Points (after calculation) by 1 for each of their Power Levels and their Soak Value by 1(T).", "usageLimit": null, "maxUses": 0 }
    ]
  },
  {
    "id": "mt_resourceful_08",
    "name": "Resourceful Minion",
    "standard": true,
    "description": "Shrewd and cunning, this Minion is more adaptive than most.",
    "effects": [
      { "activationType": "triggered", "keyword": "Triggered/Start of Turn", "text": "This Minion regains 3(bT) Ki Points.", "usageLimit": null, "maxUses": 0 }
    ]
  },
  {
    "id": "mt_regenerating_9",
    "name": "Regenerating Minion",
    "standard": true,
    "description": "Capable of healing itself, this Minion is prepared to take a hit.",
    "effects": [
      { "activationType": "triggered", "keyword": "Triggered/Start of Turn", "text": "This Minion regains 4(bT) Life Points.", "usageLimit": null, "maxUses": 0 }
    ]
  },
  {
    "id": "mt_sentry_0000010",
    "name": "Sentry",
    "standard": true,
    "description": "Vigilant and alert, this Minion is prepared to stand guard.",
    "effects": [
      { "activationType": "triggered", "keyword": "Triggered/Start of Combat Encounter", "text": "Select a Square within this Minion's Boosted Speed; the Minion may use the Movement Maneuver to enter that Square as an Out-of-Sequence Maneuver. Afterwards it cannot use the Movement Maneuver unless returning to / moving toward the declared Square (other movement effects still work).", "usageLimit": null, "maxUses": 0 },
      { "activationType": "triggered", "keyword": "Triggered", "text": "If any Opponents enter or leave the Large Sphere AoE centered on this Minion, it uses a Basic Attack Maneuver as an Out-of-Sequence Maneuver.", "usageLimit": null, "maxUses": 0 }
    ]
  },
  {
    "id": "mt_steed_00000011",
    "name": "Steed",
    "standard": true,
    "description": "Capable of carrying your burdens, this Minion is ready to ride out.",
    "effects": [
      { "activationType": "passive", "keyword": "Passive", "text": "You can treat this Minion as a Vehicle with the Open Quality; its Square Occupancy is the number of Squares it occupies. You cannot Pilot a Minion of a lower Size Category than yours; same Size Category → its Speed and Defense Value are reduced by 1(bT). Minions used this way only gain 1 Action through the Command Maneuver.", "usageLimit": null, "maxUses": 0 }
    ]
  },
  {
    "id": "mt_no_good_000012",
    "name": "No-Good Minion",
    "standard": true,
    "description": "This Minion is especially weak, for some reason.",
    "effects": [
      { "activationType": "passive", "keyword": "Passive", "text": "Regain any Karma Points you spent to create this Minion.", "usageLimit": null, "maxUses": 0 },
      { "activationType": "passive", "keyword": "Passive", "text": "Halve this Minion's Life Points and reduce their Combat Rolls and Soak Value by 2(bT).", "usageLimit": null, "maxUses": 0 }
    ]
  },
  {
    "id": "mt_summonable_013",
    "name": "Summonable Minion",
    "standard": true,
    "description": "This Minion appears when you call for them, and disappears when they are no longer needed or become defeated.",
    "effects": [
      { "activationType": "triggered", "keyword": "Triggered/Defeated", "text": "Instead of dying, this Minion disappears and leaves the Combat Encounter. It cannot join the next Combat Encounter or be summoned during it.", "usageLimit": null, "maxUses": 0 },
      { "activationType": "triggered", "keyword": "Triggered, 1/Encounter", "text": "At the start of the Master's turn, they may summon this Minion by spending 4(bT) Ki Points; it appears on an adjacent Square of the Master's choice, immediately joining the Combat Encounter.", "usageLimit": "encounter", "maxUses": 1 }
    ]
  },
  {
    "id": "mt_trained_000014",
    "name": "Trained Minion",
    "standard": true,
    "stackable": true,
    "description": "This Minion has taken the time to grow in power, becoming stronger and stronger.",
    "effects": [
      { "activationType": "passive", "keyword": "Passive", "text": "Can be taken any number of times. This Minion's Maximum Life Points and Ki Points (after calculation) are increased by 2, and its Combat Rolls by 1.", "usageLimit": null, "maxUses": 0 }
    ]
  },
  {
    "id": "mt_minion_class015",
    "name": "Minion Class",
    "commanderOnly": true,
    "hasOptions": true,
    "options": ["Pretty One", "Weird One with the Freaky Power", "Big Tough Stupid One", "Ascended Minion"],
    "description": "Everyone's got a gimmick, and your gimmick helps you stand out among the crowd. Granted to ALL Minions of a Master with the Commander Manifested Power (Motley Crew). Duplicate Minions are excluded.",
    "effects": [
      { "activationType": "ruling", "keyword": "Ruling", "text": "All effects that refer to 'Z' refer to the number of stacks of Commander possessed by this Minion's Master (auto-resolved from the Master's name if their actor exists).", "usageLimit": null, "maxUses": 0 },
      { "activationType": "ruling", "keyword": "Ruling", "text": "Each Master can only possess a single Minion who selected the Ascended Minion effect.", "usageLimit": null, "maxUses": 0 },
      { "activationType": "option", "keyword": "Option + Choice", "text": "Pretty One: +ceil(PE Modifier/4) Combat Rolls, +Z Strike/Dodge. Weird One with the Freaky Power: gain a UA of up to 22 TP; +Z Might and Saving Throws. Big Tough Stupid One: +2 LP per Power Level; +Z Soak and Wound Rolls. Ascended Minion: Special Minion — ignores the Weakness, Single Attack, Thresholds, Initiative, and Ki Points & Capacity Minion Rules; double Maximum Life Points, +Z Combat Rolls and Saving Throws.", "usageLimit": null, "maxUses": 0 }
    ]
  },
  {
    "id": "mt_aggressor_00001",
    "name": "Aggressor",
    "dangerousOnly": true,
    "description": "Far less passive than most, this Minion is ready to throw down.",
    "effects": [
      { "activationType": "passive", "keyword": "Passive", "text": "This Minion ignores the effects of Recovery Periods.", "usageLimit": null, "maxUses": 0 },
      { "activationType": "triggered", "keyword": "Triggered/Start of Turn", "text": "If this Minion is not given a command through the Command Maneuver, they will still use a Basic Attack Maneuver on their turn against the nearest Opponent. If multiple Opponents are at the same distance, you can choose which Opponent is targeted.", "usageLimit": null, "maxUses": 0 }
    ]
  },
  {
    "id": "mt_phalanx_fight02",
    "name": "Phalanx Fighter",
    "dangerousOnly": true,
    "description": "A trained soldier, this Minion is disciplined and fearless.",
    "effects": [
      { "activationType": "triggered", "keyword": "Triggered", "text": "When the Master of a Minion with the Phalanx Fighter Trait uses the Command Maneuver with that Minion as the target, all Minions with the Phalanx Fighter Trait can be controlled, and are treated as if targeted by the Command Maneuver. However, all Minions with the Phalanx Fighter Trait must make the same Maneuvers and every Attacking Maneuver or Unique Ability used by a Minion with the Phalanx Fighter Trait costs an additional 2(T) Ki Points. If they use the Movement Maneuver, they can move in different directions but if they use an Attacking Maneuver, it must be the same Attacking Maneuver (using the same Foundation and Profile if applicable). If the Transformation Maneuver is used by Minions with the Phalanx Fighter Trait, the Minions must enter a Transformation of the same type (Alternate Form/Enhancement Power) but they do not need to enter the same Transformation.", "usageLimit": null, "maxUses": 0 }
    ]
  }
];
