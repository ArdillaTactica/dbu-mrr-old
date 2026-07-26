// =============================================================================
// BASIC ITEMS CATALOG
// All Basic Items + Special Basic Items from basic-items-accessories.txt
//
// Entry shape:
//   { id, name, isTech, isSpecial, craftDC, description, effects }
//
// craftDC values: "novice" | "apprentice" | "qualified" | "expert" | "master" | "grandmaster" | "variable" | "special"
// =============================================================================

export const BASIC_ITEMS_CATALOG = {

  // ---------------------------------------------------------------------------
  // STANDARD BASIC ITEMS
  // ---------------------------------------------------------------------------

  arcosian_tail_empowered: {
    id: "arcosian_tail_empowered",
    name: "Arcosian Tail (Empowered)",
    isTech: false,
    isSpecial: false,
    craftDC: "apprentice",
    description: "The most delicious meal in the universe, it gives you an immense power boost!",
    effects: "1 Action to consume. Regain 2d10(bT) Ki Points (Arcosian's bT) and gain 1 stack of Power for the rest of the encounter. Cannot be crafted without removing an Arcosian's tail; not available via Gear Kit."
  },

  bomb: {
    id: "bomb",
    name: "Bomb",
    isTech: true,
    isSpecial: false,
    craftDC: "variable",
    description: "An explosive device that can be utilized as a weapon or a safeguard.",
    effects: "Select Trigger (Timed/Proximity/Remote). On explosion: all characters in a Minor Sphere AoE must make an Acrobatics check vs Craft DC; on fail, suffer 3d10(bT) damage. Increase Craft DC by up to 3 for +1d10(bT) damage and +1 AoE Magnitude each step."
  },

  capsule: {
    id: "capsule",
    name: "Capsule",
    isTech: true,
    isSpecial: false,
    craftDC: "qualified",
    description: "An item that can hold almost anything in it, keeping it in a compact, easy to carry device.",
    effects: "1 Action to throw at a Square within 2x your Force Score; the contained item appears instantly. Cannot capsule living things or another capsule."
  },

  capsule_house: {
    id: "capsule_house",
    name: "Capsule House",
    isTech: true,
    isSpecial: false,
    craftDC: "variable",
    description: "A house inside a capsule, convenient for travel, living on the go, or moving on short notice.",
    effects: "Creates a Minor Base (HV 2 before Dev Points) with 6 Dev Points. Increase Craft DC by up to 3 for +4 Dev Points each step. Reverts to capsule by 1 Action when adjacent and empty."
  },

  communicator: {
    id: "communicator",
    name: "Communicator",
    isTech: true,
    isSpecial: false,
    craftDC: "apprentice",
    description: "A long-range communications device enabling real-time communication across vast distances.",
    effects: "Communicate with anyone else with a Communicator within the same galaxy. Scouters and Galactic Receivers count as Communicators."
  },

  crystal_ball: {
    id: "crystal_ball",
    name: "Crystal Ball",
    isTech: false,
    isSpecial: false,
    craftDC: "expert",
    description: "A mystical orb of glass or precious mineral that allegedly gives some the ability to see into the unknown.",
    effects: "With Second Sight Unique Ability, project visions to nearby. Otherwise Expert Use Magic to use Second Sight through the ball. While held, Clairvoyance Skill Checks may use Use Magic Skill Bonus. Magical Materialization DC: Qualified."
  },

  dragon_radar: {
    id: "dragon_radar",
    name: "Dragon Radar",
    isTech: true,
    isSpecial: false,
    craftDC: "master",
    description: "A radar for finding the notorious Dragon Balls.",
    effects: "Locates Dragon Balls by their electromagnetic pulse. Range (set by ARC) can be continent/planet/universe wide. Minimum range 10 Squares."
  },

  key: {
    id: "key",
    name: "Key",
    isTech: false,
    isSpecial: false,
    craftDC: "qualified",
    description: "A tool to open a lock, this item is practically a necessity for any home.",
    effects: "When created, target a Base's Door you own or a Basic Item that requires it. Works only on that chosen target."
  },

  longevity_supplement: {
    id: "longevity_supplement",
    name: "Longevity Supplement",
    isTech: false,
    isSpecial: false,
    craftDC: "expert",
    description: "An aid to health, this item extends your expected lifespan.",
    effects: "1 Action to consume. Stop suffering from Fatigued or Stress Exhaustion. Once per Combat Encounter."
  },

  poison_vial: {
    id: "poison_vial",
    name: "Poison Vial",
    isTech: false,
    isSpecial: false,
    craftDC: "expert",
    description: "A vial containing a deadly poison to use against your enemies.",
    effects: "Has 1d6 Poison Drops when created. 1 Action + 1 Drop to Poison a Weapon. A Poisoned Weapon inflicts Poisoned Combat Condition on knock through a Health Threshold. Wears off at end of encounter."
  },

  remote_control: {
    id: "remote_control",
    name: "Remote Control",
    isTech: true,
    isSpecial: false,
    craftDC: "expert",
    description: "Wireless communication device for the advanced systems of a Battle Jacket.",
    effects: "On creation, select an accessible Battle Jacket. While holding, spend Actions to control it as if Piloting. Doesn't work if BJ has a Pilot."
  },

  remote_detonator: {
    id: "remote_detonator",
    name: "Remote Detonator",
    isTech: true,
    isSpecial: false,
    craftDC: "qualified",
    description: "A device capable of sending a radio signal to activate other devices, most commonly bombs.",
    effects: "1 Action to activate all connected Bombs. May connect to other Bombs via Craft: Basic Item or Knowledge: Science check vs that Bomb's Craft DC."
  },

  rice_cooker: {
    id: "rice_cooker",
    name: "Rice Cooker",
    isTech: true,
    isSpecial: false,
    craftDC: "apprentice",
    description: "An electric pot designed to cook rice to delicious perfection.",
    effects: "On gain and at the start of each Combat Encounter, roll 1d10. On 10, gain a Snack Basic Item. Usable for the Mafuba Unique Ability."
  },

  robotic_minion: {
    id: "robotic_minion",
    name: "Robotic Minion",
    isTech: true,
    isSpecial: false,
    craftDC: "expert",
    description: "An automated device capable of performing complex physical tasks but incapable of independent thought.",
    effects: "Create a Minion using the Minion Creation rules. Race must be Robot."
  },

  sake_bottle: {
    id: "sake_bottle",
    name: "Sake Bottle",
    isTech: false,
    isSpecial: false,
    craftDC: "qualified",
    description: "A flask, gourd, or other drink container which you can fill with your choice of drink.",
    effects: "On creation, roll 1d10 — that's the Alcohol amount. 1 Action + 1 Alcohol enters Drunk Special State until end of next turn. Can refill. When empty, usable for Mafuba Unique Ability."
  },

  scout_scope: {
    id: "scout_scope",
    name: "Scout Scope",
    isTech: true,
    isSpecial: false,
    craftDC: "apprentice",
    description: "A handheld device capable of indicating a combatant's individual combat strength.",
    effects: "3 Actions to scan a character or planet for power levels. Target may resist with Qualified Concealment Skill Check (if using Holding Back or aware). On fail, learn target's current ToP and location; if current ToP == base ToP, also learn Power Level."
  },

  sealing_bottle: {
    id: "sealing_bottle",
    name: "Sealing Bottle",
    isTech: false,
    isSpecial: false,
    craftDC: "expert",
    description: "A small, leak-proof bottle designed for long-term storage.",
    effects: "Holds a small amount of liquid. Usable for the Mafuba Unique Ability without a Sealing Talisman. Still must spend 1 Action to seal."
  },

  sealing_talisman: {
    id: "sealing_talisman",
    name: "Sealing Talisman",
    isTech: false,
    isSpecial: false,
    craftDC: "qualified",
    description: "A mystical charm crafted to blockade or trap evil spirits.",
    effects: "1 Action to apply to a container holding a Mafuba-sealed character; sealed indefinitely until seal removed (Called Shot or 1 Action adjacent). Magical Materialization DC: Apprentice."
  },

  shock_remote: {
    id: "shock_remote",
    name: "Shock Remote",
    isTech: true,
    isSpecial: false,
    craftDC: "expert",
    description: "A remote linked to a Shock Collar Accessory.",
    effects: "On creation, select a Shock Collar. Counter Action to interrupt a Maneuver by the wearer. Target makes Steadfast Check at -2 DS; on fail, fails the Maneuver and can't use it again until end of their turn. Ignore -2 penalty if target is in Rage."
  },

  smoke_bomb: {
    id: "smoke_bomb",
    name: "Smoke Bomb",
    isTech: false,
    isSpecial: false,
    craftDC: "apprentice",
    description: "A mixture of black powder and chemicals set to ignite upon physical impact, creating a thick black cloud.",
    effects: "1 Action to throw at a Square within 6 Squares. Creates Destructive Sphere AoE — applies Fog Battle Weather and Natural Weather Obscuring Fog. Lasts until end of next turn."
  },

  snack: {
    id: "snack",
    name: "Snack",
    isTech: false,
    isSpecial: false,
    craftDC: "apprentice",
    description: "A delicious and satisfying treat to keep you going when your energy is low.",
    effects: "1 Action to consume. Regain 1d10(bT) Life and Ki Points."
  },

  taser: {
    id: "taser",
    name: "Taser",
    isTech: true,
    isSpecial: false,
    craftDC: "qualified",
    description: "A handheld object that can be used to incapacitate an enemy.",
    effects: "1 Action while held: target within Melee Range. Clash (Strike vs Strike/Dodge). On win: target knocked Prone, can't stand until end of next turn. Increase Craft DC to Expert: +3 Melee Range when using this."
  },

  torch: {
    id: "torch",
    name: "Torch",
    isTech: false,
    isSpecial: false,
    craftDC: "novice",
    description: "A handheld light source you can carry with you.",
    effects: "1 Action to turn on. While held, Visibility goes from No Sight → Limited Sight or Limited → Normal. Doesn't apply while Blinded."
  },

  // ---------------------------------------------------------------------------
  // SPECIAL BASIC ITEMS (ARC-only, cannot be crafted)
  // ---------------------------------------------------------------------------

  bag_of_senzu_beans: {
    id: "bag_of_senzu_beans",
    name: "Bag of Senzu Beans",
    isTech: false,
    isSpecial: true,
    craftDC: "special",
    description: "A bag containing the miraculous Senzu Beans.",
    effects: "1 Action to consume a bean or feed to an adjacent Defeated character. Removes all Combat Conditions and fully restores Life/Ki Points. Sizes: Small (1d4), Standard (1d6), Large (1d10), Extra Large (2d6) beans."
  },

  energy_suction_device: {
    id: "energy_suction_device",
    name: "Energy-Suction Device",
    isTech: false,
    isSpecial: true,
    craftDC: "special",
    description: "An item for gathering and storing energy.",
    effects: "Gain Power Drain Special Maneuver — stored KP go into the device (not your pool). 1 Action to retrieve stored KP, or spend them on Unarmed Energy/Magic Attacks. Up to 3 Actions for Power Drain (Physical Strike vs Dodge in Melee Range)."
  },

  fruit_from_tree_of_might: {
    id: "fruit_from_tree_of_might",
    name: "Fruit from the Tree of Might",
    isTech: false,
    isSpecial: true,
    craftDC: "special",
    description: "A fruit from the legendary Tree of Might, said to make any warrior nigh-unstoppable.",
    effects: "1 Action to consume. Restore all KP and increase Attribute Scores (AG/FO/TE/MA) by 2 (ignores Attribute Score Limit). Use Transformation Maneuver to enter Doping Enhancement Power as Out-of-Sequence. Max 1 per encounter, 3 total ever."
  },

  heros_flute: {
    id: "heros_flute",
    name: "Hero's Flute",
    isTech: false,
    isSpecial: true,
    craftDC: "special",
    description: "A magical flute that carries the wishes of the people.",
    effects: "1 Action to play (no Performance Check needed). Reduce all damage taken by -3(T) until start of next turn. A Magical Unique Ability can be infused — play 2 Actions instead of paying the ability's Action or KP cost."
  },

  saibamen_capsule: {
    id: "saibamen_capsule",
    name: "Saibamen Capsule",
    isTech: false,
    isSpecial: true,
    craftDC: "special",
    description: "A container for seeds; these alien plants grow into semi-intelligent creatures capable of basic instructions.",
    effects: "On gain, roll 1d8 for the number of Saibamen possessed. 1 Action to plant a Seed; next round sprouts within 2 Squares as Saibamen Minions (Race: Saibamen)."
  },

  seeds_of_tree_of_might: {
    id: "seeds_of_tree_of_might",
    name: "Seed(s) of the Tree of Might",
    isTech: false,
    isSpecial: true,
    craftDC: "special",
    description: "Small green seeds that grow a Tree of Might.",
    effects: "Planted on a life-bearing planet, takes 10 hours to grow fruit-bearing. Once grown, roll 1d6 for total Fruit. The Tree: HV 2, 100(bT) LP, 10(bT) Soak. Pre-grown: any attack > 100 damage destroys it."
  },

  universe_seed: {
    id: "universe_seed",
    name: "Universe Seed",
    isTech: false,
    isSpecial: true,
    craftDC: "special",
    description: "A potent seed which possesses extraordinary powers great enough to transcend reality and spawn new universes.",
    effects: "At end of each encounter, gains Universal Power = sum of bT of every Defeated character. At 40 UP: unlock Ultimate Form Legendary Form. At 60 UP: unlock Godslayer Legendary Form. Can also grow a Universal Tree."
  }
};

/**
 * Craft DC label mapping for the dropdown display.
 */
export const CRAFT_DC_LABELS = {
  novice: "Novice",
  apprentice: "Apprentice",
  qualified: "Qualified",
  expert: "Expert",
  master: "Master",
  grandmaster: "Grandmaster",
  variable: "Variable",
  special: "Special (ARC only)"
};
