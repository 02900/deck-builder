interface BanlistInfo {
  ban_goat: string;
}

interface ICardImage {
  id: number;
  image_url: string;
  image_url_small: string;
}

interface ICardBase {
  id: number;
  name: string;
  type: string;
  race: string;
  desc: string;
  card_images: ICardImage[];
  archetype?: string;
  banlist_info?: BanlistInfo;
}

interface ICardMonster extends ICardBase {
  atk: number;
  def: number;
  level: number;
  attribute: string;
  linkval?: number;
  linkmarkers?: string[];
}

export type TCard = ICardBase | ICardMonster;
