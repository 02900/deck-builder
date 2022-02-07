export interface IQueryConfig {
  num: number;
  offset: number;
}

export interface IQueryParams {
  name?: string;
  atk?: string;
}

interface IBanListInfo {
  ban_goat: string;
}

interface ICardSet {
  set_name: string;
  set_code: string;
  set_rarity: string;
  set_rarity_code: string;
  set_price: string;
}

interface ICardImage {
  id: number;
  image_url: string;
  image_url_small: string;
}

interface ICardPrice {
  cardmarket_price: string;
  tcgplayer_price: string;
  ebay_price: string;
  amazon_price: string;
  coolstuffinc_price: string;
}

interface ICardData {
  id: number;
  name: string;
  type: string;
  desc: string;
  attribute: string;
  race: string;
  card_sets: ICardSet[];
  card_images: ICardImage[];
  card_prices: ICardPrice[];
  atk?: number;
  def?: number;
  level?: number;
  archetype?: string;
  linkval?: number;
  linkmarkers?: string[];
  banlist_info?: IBanListInfo;
}

interface IMeta {
  current_rows: number;
  total_rows: number;
  rows_remaining: number;
  total_pages: number;
  pages_remaining: number;
  next_page: string;
  next_page_offset: number;
}

export interface IQueryResult {
  data: ICardData[];
  meta: IMeta;
}

