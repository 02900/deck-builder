import { IQueryParams } from '@services/ygo-api';

export interface ISearchParams {
  category?: Category;
  type?: string;
  race?: string;
  attribute?: string;
  query?: string;
}

export class SearchParams {
  constructor(readonly search: ISearchParams) { }

  toQueryParams(): IQueryParams {
    let queryParams: IQueryParams = {
      fname: this.search.query,
      desc: this.search.query,
      type: this.search.type,
      attribute: this.search.attribute,
      race: this.search.race,
    };

    if (this.search.category && this.search.category !== Category.Monster) {
      queryParams.type = this.search.category
        ? `${this.search.category} card`
        : undefined;
      queryParams.race = this.search.type;
    }

    return queryParams;
  }
}

export enum Category {
  Monster = 'monster',
  Spell = 'spell',
  Trap = 'trap',
}
