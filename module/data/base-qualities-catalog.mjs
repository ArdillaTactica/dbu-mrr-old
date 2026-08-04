/**
 * Base Qualities catalog (bases.txt — https://dbu-rpg.com/bases/).
 *
 * devCost: display string ("2+", "2~4", "1"). Variable-cost qualities take the
 * actual spent amount from the per-row `devSpent` input on the sheet.
 * special: true → given by ARC, no Dev Point cost.
 */

export const BASE_SIZES = {
  minor:    { label: "Minor",    dr: 2,  lp: 0,  squares: "6×6",   devCost: 0 },
  moderate: { label: "Moderate", dr: 4,  lp: 10, squares: "12×12", devCost: 2 },
  major:    { label: "Major",    dr: 8,  lp: 20, squares: "24×24", devCost: 4 },
  massive:  { label: "Massive",  dr: 16, lp: 40, squares: "48×48", devCost: 8 }
};

export const BASE_HARDNESS = {
  1: { dr: 0, metal: false, devCost: 0 },
  2: { dr: 1, metal: false, devCost: 1 },
  3: { dr: 2, metal: true,  devCost: 2 },
  4: { dr: 4, metal: true,  devCost: 4 }
};

export const BASE_QUALITIES_CATALOG = {
  // ── Normal Qualities ─────────────────────────────────────────────
  barracks: {
    name: "Barracks", devCost: "2+", occupancy: "2×6", special: false, variable: true,
    prerequisite: "Personality Score 4+, 2+ Minions, Room",
    effect: "Store Minions on your Base. With Training Facilities: one Minion may spend 1 DT per Downtime Period. Minions are 'spent' until end of your next Combat Encounter. +1 Dev: +2 to one occupancy axis (stackable). Each stored Minion takes 4× their Squares."
  },
  recruitment_agency: {
    name: "Recruitment Agency", devCost: "2", occupancy: "N/A", special: false, variable: false,
    prerequisite: "Personality Score 6+, Barracks",
    effect: "Treat your number of Minions as +X higher for Base Quality effects (X = 1/2 Owner's Personality Score, rounded up)."
  },
  security_detail: {
    name: "Security Detail", devCost: "2+", occupancy: "N/A", special: false, variable: true,
    prerequisite: "Personality Score 6+, Barracks",
    effect: "Spend 1 Minion on Security Detail: they join Combat Encounters at the Base as Allies (own Actions + Initiative, no Command Maneuver). Auto re-spend unless ordered otherwise. +2 Dev: +1 additional Minion on Security Detail."
  },
  rr_space: {
    name: "R&R Space", devCost: "1+", occupancy: "2×2", special: false, variable: true,
    prerequisite: "Room",
    effect: "1/Downtime Period: use the Resting Activity without spending DT. Store Apparel; with Barracks, spend 1 Minion to fix one piece of Apparel (even destroyed). +1 Dev: +4 to one occupancy axis (stackable). Using it takes 4× your Squares."
  },
  training_facilities: {
    name: "Training Facilities", devCost: "6", occupancy: "6×6", special: false, variable: false,
    prerequisite: "Room",
    effect: "1/Downtime Period: use any 1-DT Training Activity without spending DT. Gigantic characters need +2 Dev (10×10 occupancy)."
  },
  medical_facilities: {
    name: "Medical Facilities", devCost: "3", occupancy: "2×4", special: false, variable: false,
    prerequisite: "Room, 2+ Skill Ranks in Medicine",
    effect: "Recovery: benefit from the NEXT Recovery option (Instant→Short→Long→Extended). Create Medicine between encounters (max = Medicine Skill Ranks): Restorative +2d8(bT) LP (TN Qualified), Energizing +2d8(bT) KP (TN Qualified), Uplifting removes Impediment/Guard Down/Shaken (TN Expert), Antivenom removes Poisoned (TN Expert), Performance Enhancing → Doping OoS (TN Master)."
  },
  culinary_facilities: {
    name: "Culinary Facilities", devCost: "1", occupancy: "2×4", special: false, variable: false,
    prerequisite: "Room",
    effect: "Cooking Skill Checks in this Room: +2 Natural Result (max 10). Store Ingredients. Spend Minions → +1 Ingredient each (1d10: 1-6 Standard, 7-9 Rare, 10 Very Rare)."
  },
  laboratory: {
    name: "Laboratory", devCost: "2", occupancy: "4×4", special: false, variable: false,
    prerequisite: "Room",
    effect: "Knowledge (Science)/Craft Skill Checks in this Room: +2 Natural Result (max 10). Spend Minions to craft Basic Items (their Skills). Vehicle = 3 Minions, Battle Jacket = 5 Minions (highest Skills between them)."
  },
  armory: {
    name: "Armory", devCost: "1", occupancy: "2×4", special: false, variable: false,
    prerequisite: "N/A",
    effect: "Store Weapons (only Owners may take them out; Barracks Minions may wield them). Spend 1 Minion to fix a Weapon (Break Value reset to highest)."
  },
  communications: {
    name: "Communications", devCost: "1", occupancy: "2×2", special: false, variable: false,
    prerequisite: "2+ Skill Ranks in Knowledge (Science)",
    effect: "Communicate with the Base via any Communicator (same galaxy). Spend Minions remotely; a Minion may act as Owner for Base Quality effects / improvements while away."
  },
  environmental_positioning: {
    name: "Environmental Positioning", devCost: "1", occupancy: "N/A", special: false, variable: false,
    prerequisite: "2+ Skill Ranks in Knowledge (Science)",
    effect: "The Base is in a unique Battle Environment (Underwater, Upper Atmosphere, Space…). Characters within are unaffected by it. Incompatible with Traveling Base."
  },
  hangar: {
    name: "Hangar", devCost: "1+", occupancy: "4×4", special: false, variable: true,
    prerequisite: "Room",
    effect: "Store Vehicles/Battle Jackets. Spend Minions to fully restore their LP. With Communications + Communicator: spend a Minion to bring one to your location. +1 Dev: +4 to one occupancy axis (stackable). All Squares on one side must be Entrances."
  },
  prison: {
    name: "Prison", devCost: "2+", occupancy: "2×2", special: false, variable: true,
    prerequisite: "Room",
    effect: "Store Defeated Opponents (Prisoners). Base Damage Reduction ×5 against the Prison. Spend Minions to watch Prisoners (escape attempt → Alert: all Minions enter combat, own Actions/Initiative). +1 Dev: +4 to one occupancy axis (stackable)."
  },
  armament: {
    name: "Armament", devCost: "1+", occupancy: "1 (Solid)", special: false, variable: true,
    prerequisite: "N/A",
    effect: "Turret. Enter with 1 Action (adjacent). Basic Attack (Energy type chosen at creation) +1d8(bT) Wound, Owner's ToP, Force Modifier +5(bT), own 30(bT) KP pool. Security Detail Minions may start combat inside. +1 Dev: +1 Armament."
  },
  self_defense_system: {
    name: "Self-Defense System", devCost: "2", occupancy: "2×1", special: false, variable: false,
    prerequisite: "Room, 2+ Skill Ranks in Knowledge (Science)",
    effect: "Opponents in the Room: Perception Check (TN Master) at start of turn or movement −3/4 until next turn. Armaments in the Room attack 1/Round as Instant Maneuver even unmanned (Owner's base AG/IN for Haste/Awareness)."
  },
  cloaking: {
    name: "Cloaking", devCost: "4", occupancy: "N/A", special: false, variable: false,
    prerequisite: "Scholarship Score 10+",
    effect: "The Base is hidden (illusion/hologram/invisible). No character can find it unless they've been there or are led there."
  },
  sub_base: {
    name: "Sub-Base", devCost: "4", occupancy: "N/A", special: false, variable: false,
    prerequisite: "N/A",
    effect: "Second Base underground: same Hardness, −1 Base Size. Survives the main Base's destruction (its own Qualities with occupancy above are lost). Incompatible with Traveling Base."
  },
  multi_floor_base: {
    name: "Multi-Floor Base", devCost: "2+", occupancy: "2×2 (Solid)", special: false, variable: true,
    prerequisite: "Scholarship Score 5+",
    effect: "Base occupancy shrinks −1 Base Size; gain a Floor above (same stats, own Qualities; no Multi-Floor/Sub-Base on it). Move between floors: 1 Action adjacent to the occupancy. +1 Dev: +1 Floor."
  },
  traveling_base: {
    name: "Traveling Base", devCost: "2~4", occupancy: "1 (Solid)", special: false, variable: true,
    prerequisite: "2+ Skill Ranks in Knowledge (Science)",
    effect: "The Base is an operational Vehicle (create one, ignore Volume; Craft TN by Dev spent: 2=Expert, 3=Master, 4=Grandmaster). Free Life Systems + Living Space. Occupancy = Pilot seat; spend 1 Minion as Pilot. With Communications: spend a Minion to bring the Base to you."
  },
  escape_pods: {
    name: "Escape Pods", devCost: "2~4+", occupancy: "Varies", special: false, variable: true,
    prerequisite: "N/A",
    effect: "Enter adjacent Pod as Instant Maneuver. On Base destruction: auto-eject max Movement away; if outside the Base occupancy, no Impulsive Save and no damage. Pod is a Vehicle (Craft TN: 2=Qualified, 3=Expert, 4=Master). +1 Dev: +1 Pod copy."
  },
  global_radar: {
    name: "Global Radar", devCost: "1", occupancy: "2×2", special: false, variable: false,
    prerequisite: "2+ Skill Ranks in Knowledge (Science)",
    effect: "Spend 1 Minion to search for a known material/energy source (e.g. Dragon Ball radiation, a Ki Signature). ARC reports the result when they become free."
  },
  weather_control: {
    name: "Weather Control", devCost: "2+", occupancy: "N/A", special: false, variable: true,
    prerequisite: "3+ Skill Ranks in Knowledge (Science), Base on a Planet",
    effect: "1 Action: set Battle Weather within 10 Squares of the Base (excluding inside) until end of your next turn. Spend 1 Minion stationed → use as Instant Maneuver. +2 Dev: affect the entire planet."
  },
  deployable_robots: {
    name: "Deployable Robots", devCost: "2", occupancy: "N/A", special: false, variable: false,
    prerequisite: "Scholarship Score 6+, Laboratory",
    effect: "Robotic Minions stored without counting toward Barracks limit. 1 Action: deploy to any Square in/within 10 Squares of the Base (same planet: arrival in ARC-decided Rounds). Deployed robots need no Command Maneuver but can't be spent."
  },
  protected_safe: {
    name: "Protected Safe", devCost: "1", occupancy: "2×2 (Solid)", special: false, variable: false,
    prerequisite: "N/A",
    effect: "Store items/Weapons/Apparel (2 Actions adjacent). Only Owners retrieve (1 Action). Thieves: 3 Actions + Thievery TN Expert (triggers Counter Actions within 4 Squares, −3 Dice Score per attack). Destroyed: Basic Items lost, rest scattered, Weapons/Apparel −2 Break Value."
  },
  structural_reinforcement: {
    name: "Structural Reinforcement", devCost: "4", occupancy: "N/A", special: false, variable: false,
    prerequisite: "Base Hardness Value 3+",
    effect: "Reduce all Damage inflicted to the Base by −1/2."
  },
  reinforced_entrance: {
    name: "Reinforced Entrance", devCost: "2", occupancy: "N/A", special: false, variable: false,
    prerequisite: "Base Hardness Value 2+",
    effect: "Owner: 1 Action to Seal Entrances / Instant Maneuver to Unseal. Sealed Entrances can't be used. New Entrances require the Base at 1/2 LP (instead of 3/4) and can't be Sealed."
  },
  blutz_wave_generators: {
    name: "Blutz Wave Generators", devCost: "1", occupancy: "1×4 (Solid)", special: false, variable: false,
    prerequisite: "3+ Knowledge (Science), 2+ Knowledge (Saiyans)",
    effect: "1 Action: target a Saiyan within 10 Squares — they may transform into Oozaru as OoS Maneuver without Full Moon/Tail (no revert from moon loss; Tail retained during, lost on leaving)."
  },
  library: {
    name: "Library", devCost: "1+", occupancy: "2×2", special: false, variable: true,
    prerequisite: "Room, 2+ Skill Ranks in any Knowledge Skill",
    effect: "1/Downtime Period: Studying Activity without spending DT. Choose a Knowledge option: +2 Natural Result (max 10) on those checks in this Room. +1 Dev: +1 to one occupancy axis AND +1 additional Knowledge option."
  },
  trap_door: {
    name: "Trap Door", devCost: "1+", occupancy: "1×1", special: false, variable: true,
    prerequisite: "N/A",
    effect: "Chosen Square: Dropped Floor (descend to floor below — needs Sub-Base/Multi-Floor) or Catapult (Acrobatics TN Expert or ejected 1d10 Squares outside). +1 Dev: +1 Trap Door or +1 occupancy axis. Same effect per Floor."
  },
  battle_chamber: {
    name: "Battle Chamber", devCost: "3+", occupancy: "4×4", special: false, variable: true,
    prerequisite: "2+ Skill Ranks in Knowledge (Science), Room",
    effect: "Designated arena. 1 Minion per 4 Squares as Guardians (fight intruders immediately). +1 Dev: +4 to one occupancy axis. Options: Terrain (1+ Dev, 3 features ≤ Base Hardness), Climate Conditioning (+2 Dev, constant Battle Weather), Environmental Conditioning (3 Dev, Battle Environment)."
  },
  // ── Special Qualities (ARC-given) ────────────────────────────────
  meta_core: {
    name: "Meta Core", devCost: "Special", occupancy: "N/A", special: true, variable: false,
    prerequisite: "N/A",
    effect: "External Living Base with you as Avatar. Meta Clones: Duplicate Minions via Avatar Maneuver (lose highest-ToP Transformation, gain 3 stacks of Cybernetic Enhancement). Controlled Meta Clone: full control, your max LP/KP, no Command Maneuver, full Actions/Counter Actions."
  },
  room_of_spirit_and_time: {
    name: "Room of Spirit and Time", devCost: "Special", occupancy: "2×4 (Solid)", special: true, variable: false,
    prerequisite: "N/A",
    effect: "Hyperbolic Time Chamber: a year of training in a day. First full 24h: 3 DT immediately + Gravity (10x) and Life Threatening modifiers (later visits: 2 DT). Optional (ARC): +2 Power Levels on first exit. Inside: Planetary Base + R&R Space (4×8) + Culinary Facilities."
  },
  magic_teleportation: {
    name: "Magic Teleportation", devCost: "Special", occupancy: "2×2", special: true, variable: false,
    prerequisite: "Room, 4+ Skill Ranks in Use Magic",
    effect: "2 Actions + Use Magic TN Master: teleport this Room (Qualities + Characters) to any known location it fits. Still part of the Base; recall as Instant Maneuver."
  },
  planetary_base: {
    name: "Planetary Base", devCost: "Special", occupancy: "N/A", special: true, variable: false,
    prerequisite: "N/A",
    effect: "The Base is an entire planet — no Square Occupancy limits. If occupied: unlimited Minions (can't fight; usable for Quality effects except Security Detail)."
  },
  base_empowerment: {
    name: "Base Empowerment", devCost: "Special", occupancy: "N/A", special: true, variable: false,
    prerequisite: "Planetary Base",
    effect: "While within/near the Base's planet: +1 Tier of Power (Breakthrough) and −1 Critical Target on all Combat Rolls (max 7). Applies to all members of a Race chosen when gained."
  },
  supercomputer: {
    name: "Supercomputer", devCost: "Special", occupancy: "2×2 (Solid)", special: true, variable: false,
    prerequisite: "Scholarship Score 10+, 4+ Skill Ranks in Knowledge (Science)",
    effect: "Spend 5 Minions → Super Minion (Ascended Minion Talent benefits; Android/Neo-Tuffle/Bio-Android only; max 1). Counts as 5 Minions for Laboratory/Hangar/Armaments/Supercomputer/Meta Core. Uses Owner's Skill Checks."
  }
};
