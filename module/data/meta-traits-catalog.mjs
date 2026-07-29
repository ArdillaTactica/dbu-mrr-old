// Arcosian Meta Traits catalog for the DBU system
// Source: https://dbu-rpg.com/metamorphosis/ (Meta Traits section)
// Gained via: Divergent Evolution (1) and each Metamorphosis stage (S+1,
// chosen independently per stage; True Form must include Bio-Suit and
// Redirected Energy). `name` strings must stay in sync with the lowercase
// checks in racial-automation/alternate-forms.mjs.

export const META_TRAITS_CATALOG = [
  {
    id: "meta_aerodynamic",
    name: "Aerodynamic",
    description: "With simple modifications and a slimming of your physique, you can take full advantage of your newly manufactured maneuverability.",
    effects: [
      { activationType: "passive", keyword: "Passive", text: "Increase your Speed by 1(T)." },
      { activationType: "passive", keyword: "Passive", text: "Reduce the Ki Point Cost for using your Boosted Speed from 3 Ki Points per Square to 1 Ki Point per Square." },
      { activationType: "limited", keyword: "Triggered, 1/Round", text: "If you hit an Opponent with an Attacking Maneuver and deal Damage, you may use the Movement Maneuver as an Out-of-Sequence Maneuver." }
    ]
  },
  {
    id: "meta_bestial_evolution",
    name: "Bestial Evolution",
    description: "What nature creates, you improve upon.",
    bestialChoice: ["bestial_movement", "bestial_claws", "bestial_impaling_horns", "bestial_treacherous_spikes"],
    effects: [
      { activationType: "passive", keyword: "Permanent, Passive", text: "Gain either the Bestial Movement, Claws, Impaling Horns, or Treacherous Spikes Bestial Trait." }
    ]
  },
  {
    id: "meta_bio_suit",
    name: "Bio-Suit",
    description: "Arcosians are the toughest beings in the universe; covered in a durable hide, it takes immense punishment to keep you down.",
    effects: [
      { activationType: "passive", keyword: "Passive", text: "Increase your Damage Reduction by 2(T)." },
      { activationType: "passive", keyword: "Passive", text: "Increase the Dice Score of your Steadfast Checks by 1." }
    ]
  },
  {
    id: "meta_burning_hatred",
    name: "Burning Hatred",
    description: "You single out a foe, and when they can no longer provide any entertainment, you turn your vicious gaze to another.",
    effects: [
      { activationType: "triggered", keyword: "Triggered/Transform", text: "Select an Opponent. You gain the Compelled Combat Condition against that Opponent until you leave this Transformation." },
      { activationType: "passive", keyword: "Passive", text: "While you are suffering from the Compelled Combat Condition, increase your Wound Rolls by 1d6(T)." },
      { activationType: "triggered", keyword: "Triggered", text: "If the selected Opponent is Defeated, lose Compelled and you may trigger the first effect again." }
    ]
  },
  {
    id: "meta_elongated_tail",
    name: "Elongated Tail",
    description: "A longer, more dexterous, and stronger tail gives you quite an advantage over less evolved races.",
    effects: [
      { activationType: "triggered", keyword: "Triggered", text: "If you would use the Tail Attack Maneuver, increase your Melee Range by 1 Square for the duration of that Attacking Maneuver." },
      { activationType: "limited", keyword: "Triggered, 1/Round", text: "If you hit an Opponent with your Tail Attack Maneuver, you may use the Grapple Maneuver against that Opponent as an Out-of-Sequence Maneuver." }
    ]
  },
  {
    id: "meta_frozen_magician",
    name: "Frozen Magician",
    description: "Even as your blood runs hot, you remain cold as ice, keeping a level head to focus on your unusual powers.",
    effects: [
      { activationType: "limited", keyword: "Triggered, 2/Round", text: "When you gain a stack(s) of Cruelty, reduce the Ki Point Cost of all Unique Abilities you possess by 1(T) until the end of the Combat Round." },
      { activationType: "limited", keyword: "Triggered, 1/Round", text: "If you use a Unique Ability or Magic Attack, gain 1 Cruelty." }
    ]
  },
  {
    id: "meta_furious_onslaught",
    name: "Furious Onslaught",
    description: "The anger that seethes within you urges you to act and destroy.",
    effects: [
      { activationType: "limited", keyword: "1/Round", text: "Reduce your Cruelty Stacks by 2 to use the Signature Technique Maneuver as an Instant Maneuver." }
    ]
  },
  {
    id: "meta_kings_stature",
    name: "King's Stature",
    description: "You stand head and shoulders above even the largest of your kind.",
    effects: [
      { activationType: "passive", keyword: "Passive", text: "Increase your Size Category to Enormous." },
      { activationType: "limited", keyword: "Triggered/Power, 1/Encounter", text: "If you have 2+ stacks of Cruelty, treat your Size Category as if it was Gigantic for the effects of Punching Down until the end of your next turn." }
    ]
  },
  {
    id: "meta_last_resource",
    name: "Last Resource",
    description: "Should the unthinkable happen, you can unleash your pride and rage for a deadly reprisal.",
    effects: [
      { activationType: "passive", keyword: "Passive", text: "Increase your Wound Rolls by 1(T) for each Health Threshold you are below." },
      { activationType: "limited", keyword: "Triggered, 1/Encounter", text: "If you would use an Attacking Maneuver, for each Health Threshold you are below, you may spend 2(bT) Ki Points to apply an Energy Charge to that Attacking Maneuver." }
    ]
  },
  {
    id: "meta_pressure",
    name: "Pressure",
    description: "Woe be upon any foes who make you put effort into a fight.",
    effects: [
      { activationType: "passive", keyword: "Passive", text: "If you have 2+ stacks of Cruelty, increase your Strike Rolls for your Signature Techniques by 1(T)." },
      { activationType: "limited", keyword: "Triggered, 1/Round", text: "If you hit an Opponent with a Signature Technique, double the amount of Diminishing Defense they receive from that Attacking Maneuver." }
    ]
  },
  {
    id: "meta_redirected_energy",
    name: "Redirected Energy",
    description: "Your body recycles energy even as you rip apart your enemies with bursts of pure power.",
    effects: [
      { activationType: "triggered", keyword: "Triggered", text: "After using an Attacking Maneuver, regain 1(bT) Ki Points." },
      { activationType: "limited", keyword: "Triggered, 1/Round", text: "If you use an Attacking Maneuver, increase the Wound Roll of that Attacking Maneuver by 1/2 (rounded up) of its Ki Point Cost." }
    ]
  },
  {
    id: "meta_ruler",
    name: "Ruler",
    description: "A good leader knows when to delegate, and a good subordinate knows the price of failing you.",
    effects: [
      { activationType: "limited", keyword: "Triggered/Power, 1/Round", text: "Reduce your Cruelty Stacks by 2 to target all Allies within a Large Sphere AoE (centered on yourself). All targeted Allies apply your Tier of Power Extra Dice (min. 1d4) to their Combat Rolls until the start of your next turn." }
    ]
  },
  {
    id: "meta_no_quarter",
    name: "No Quarter",
    description: "Your motto is: “No quarter, no mercy, no remorse.”",
    effects: [
      { activationType: "passive", keyword: "Passive", text: "Increase the Extra Dice gained through the first effect of Brutal Assault by 2 Dice Categories." },
      { activationType: "limited", keyword: "Triggered, 1/Round", text: "If you hit an Opponent with an Attacking Maneuver for the second time in a Combat Round, apply the Guard Down Combat Condition to that Opponent for the duration of your next Attacking Maneuver or until the end of your turn." }
    ]
  },
  {
    id: "meta_variable_weight_plating",
    name: "Variable-Weight Plating",
    description: "The bio-armor that covers all Arcosians can be further modified to be made lighter or heavier.",
    options: [
      { key: "heavy", name: "Heavy Plating", text: "Increase your Soak Value by 2(T) and reduce your Defense Value by 1(T). [1/Round] Reduce incoming Damage by 1/2 (rounded up) of your Soak Value." },
      { key: "light", name: "Light Plating", text: "Increase your Defense Value by 2(T) and reduce your Soak Value by 1(T). [1/Round] Increase your Dodge Roll by 1/4 (rounded up) of your Defense Value." }
    ],
    effects: [
      { activationType: "option", keyword: "Permanent, Option", text: "Choose Heavy Plating (+2(T) Soak, -1(T) DV) or Light Plating (+2(T) DV, -1(T) Soak), each with a 1/Round trigger." }
    ]
  }
];
