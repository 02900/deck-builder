import { IQueryParams } from '@services/ygo-api';

export interface ISearchParams {
  id?: string;
  category?: Category;
  type?: string;
  race?: string;
  attribute?: string;
  query?: string;
  atk?: string;
  def?: string;
  level?: string;
  link?: string;
}

export class SearchParams {
  constructor(readonly search: ISearchParams) { }

  toQueryParams(): IQueryParams {
    const isNotMonster =
      this.search.category && this.search.category !== Category.Monster;

    return {
      id: this.search.id,
      fname: this.search.query,
      desc: this.search.query,
      type: isNotMonster
        ? `${this.search.category} card`
        : this.search.type,
      attribute: this.search.attribute,
      race: isNotMonster ? this.search.type : this.search.race,
      atk: this.search.atk,
      def: this.search.def,
      level: this.search.level,
      link: this.search.link
    };
  }
}

export enum Category {
  Monster = 'monster',
  Spell = 'spell',
  Trap = 'trap',
}
