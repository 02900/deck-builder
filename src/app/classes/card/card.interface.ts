export interface ICard {
  id: number;
  name: string;
  type: string;
  race: string;
  desc: string;
  card_images: ICardImage[];
  archetype?: string;
  atk?: number;
  def?: number;
  level?: number;
  attribute?: string;
  linkval?: number;
  linkmarkers?: string[];
  banlist_info?: BanlistInfo;
}

export interface ICardImage {
  id: number;
  image_url: string;
  image_url_small: string;
  image_url_cropped: string;
}

export interface BanlistInfo {
  ban_goat: string;
}
