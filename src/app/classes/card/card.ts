import { ICard, ICardImage, BanlistInfo } from './card.interface';

enum Category {
  MONSTER,
  SPELL,
  TRAP,
}

const trapCardId = 'Trap Card';
const spellCardId = 'Spell Card';

export class Card {
  id: number;
  name: string;
  type: string;
  race: string;
  desc: string;
  card_images: ICardImage[];
  archetype?: string;
  banlist_info?: BanlistInfo;
  atk?: number;
  def?: number;
  level?: number;
  attribute?: string;
  linkval?: number;
  linkmarkers?: string[];

  get isMonster() {
    return this.category === Category.MONSTER;
  }

  get isSpell() {
    return this.category === Category.SPELL;
  }

  get isTrap() {
    return this.category === Category.TRAP;
  }

  private get category(): Category {
    if (this.type === spellCardId) return Category.SPELL;
    if (this.type === trapCardId) return Category.TRAP;
    return Category.MONSTER;
  }

  constructor(private readonly card: ICard) {
    this.id = card.id;
    this.name = card.name;
    this.type = card.type;
    this.race = card.race;
    this.desc = card.desc;
    this.card_images = card.card_images;
    this.archetype = card.archetype;
    this.banlist_info = card.banlist_info;
    this.atk = card.atk;
    this.def = card.def;
    this.level = card.level;
    this.attribute = card.attribute;
    this.linkval = card.linkval;
    this.linkmarkers = card.linkmarkers;
  }
}
