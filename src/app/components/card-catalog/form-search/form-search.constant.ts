export const texts = {
  category: 'Category',
  type: 'Type',
  attribute: 'Attribute',
  race: 'Race',
};

export const categories = [
  { text: 'Monster', value: 'monster' },
  { text: 'Spell', value: 'spell' },
  { text: 'Trap', value: 'trap' },
];

const typeMonster = [
  { text: 'Normal Monster', value: 'normalMmonster' },
  { text: 'Effect Monster', value: 'effectMonster' },
  { text: 'Fusion Monster', value: 'fusionMonster' },
  { text: 'Fusion Effect Monster', value: 'fusionEffectMonster' },
  { text: 'Ritual Monster', value: 'ritualMonster' },
  { text: 'Ritual Effect Monster', value: 'ritualEffectMonster' },
  { text: 'Spirit Monster', value: 'spiritMonster' },
  { text: 'Union Monster', value: 'unionMonster' },
  { text: 'Gemini Monster', value: 'geminiMonster' },
  { text: 'Tuner Normal Monster', value: 'tunerNormalMonster' },
  { text: 'Tuner Effect Monster', value: 'tunerEffectMonster' },
  { text: 'Synchro Monster', value: 'synchroMonster' },
  { text: 'Synchro Effect Monster', value: 'synchroEffectMonster' },
  { text: 'Synchro Tuner Effect Monster', value: 'synchroTunerEffectMonster' },
  { text: 'Flip Effect Monster', value: 'flipEffectMonster' },
  { text: 'Toon Monster', value: 'toonMonster' },
  { text: 'XYZ Monster', value: 'xyzMonster' },
  { text: 'XYZ Effect Monster', value: 'xyzEffectMonster' },
];

const typeSpell = [
  { text: 'Normal Spell', value: 'normalSpell' },
  { text: 'Quickplay Spell', value: 'quickplaySpell' },
  { text: 'Continuous Spell', value: 'continuousSpell' },
  { text: 'Equip Spell', value: 'equipSpell' },
  { text: 'Field Spell', value: 'fieldSpell' },
];

const typeTrap = [
  { text: 'Normal Trap', value: 'normalTrap' },
  { text: 'Continuous Trap', value: 'continuousTrap' },
  { text: 'Counter Trap', value: 'counterTrap' },
];

export const types = {
  all: [...typeMonster, ...typeSpell, ...typeTrap],
  monster: typeMonster,
  spell: typeSpell,
  trap: typeTrap,
};

export const attributes = [
  { text: 'Earth', value: 'earth' },
  { text: 'Water', value: 'water' },
  { text: 'Fire', value: 'fire' },
  { text: 'Wind', value: 'wind' },
  { text: 'Light', value: 'light' },
  { text: 'Dark', value: 'dark' },
  { text: 'Divine', value: 'divine' },
];

export const races = [
  { text: 'Warrior', value: 'warrior' },
  { text: 'Spellcaster', value: 'spellcaster' },
  { text: 'Fairy', value: 'fairy' },
  { text: 'Fiend', value: 'fiend' },
  { text: 'Zombie', value: 'zombie' },
  { text: 'Machine', value: 'machine' },
  { text: 'Aqua', value: 'aqua' },
  { text: 'Pyro', value: 'pyro' },
  { text: 'Rock', value: 'rock' },
  { text: 'Winged Beast', value: 'wingedBeast' },
  { text: 'Plant', value: 'plant' },
  { text: 'Insect', value: 'insect' },
  { text: 'Thunder', value: 'thunder' },
  { text: 'Dragon', value: 'dragon' },
  { text: 'Beast', value: 'beast' },
  { text: 'Beast Warrior', value: 'beastWarrior' },
  { text: 'Dinosaur', value: 'dinosaur' },
  { text: 'Fish', value: 'fish' },
  { text: 'Sea Serpent', value: 'seaSerpent' },
  { text: 'Reptile', value: 'reptile' },
  { text: 'Psychic', value: 'psychic' },
  { text: 'Divine Beast', value: 'divineBeast' },
  { text: 'Creator God', value: 'creatorGod' },
];
