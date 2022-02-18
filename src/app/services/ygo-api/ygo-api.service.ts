import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { Card } from '@classes/card';
import { IQueryParams, IQueryConfig, IQueryResult } from './query.interface';

const LIMIT_RESULTS = 45;
const OFFSET_RESULTS = 0;

@Injectable({
  providedIn: 'root',
})
export class YgoApiService {
  private readonly API_URL = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  query(query: IQueryParams, queryConfig?: IQueryConfig): Observable<Card[]> {
    const searchByText = query.fname || query.desc;

    if (searchByText) {
      return this.searchByText(query, queryConfig);
    }

    const params = this.transformToHttpParams(query, queryConfig);
    return this.makeRequest(params);
  }

  private searchByText(
    query: IQueryParams,
    queryConfig: IQueryConfig | undefined
  ): Observable<Card[]> {
    const queryByName = { ...query };
    delete queryByName.desc;
    const paramsWithName = this.transformToHttpParams(queryByName, queryConfig);
    const resultByName$ = this.makeRequest(paramsWithName);

    const queryBtDesc = { ...query };
    delete queryBtDesc.fname;
    const paramsWithDesc = this.transformToHttpParams(queryBtDesc, queryConfig);
    const resultByDesc$ = this.makeRequest(paramsWithDesc);

    return forkJoin([resultByName$, resultByDesc$]).pipe(
      map(([s1, s2]: [Card[], Card[]]) => this.joinAndFilter(s1, s2))
    );
  }

  private makeRequest(params: HttpParams): Observable<Card[]> {
    return this.http.get<IQueryResult>(this.API_URL, { params }).pipe(
      map((results: IQueryResult) => {
        const cards = results.data.map((card) => new Card(card));
        return cards;
      })
    );
  }

  private transformToHttpParams(
    query: IQueryParams,
    queryConfig: IQueryConfig = { num: LIMIT_RESULTS, offset: OFFSET_RESULTS }
  ): HttpParams {
    const params: {
      [param: string]:
      | string
      | number
      | boolean
      | readonly (string | number | boolean)[];
    } = {};

    for (const [key, value] of Object.entries(queryConfig)) params[key] = value;

    for (const [key, value] of Object.entries(query))
      if (value) params[key] = value;

    return new HttpParams({ fromObject: params });
  }

  private joinAndFilter(s1: Card[], s2: Card[]): Card[] {
    return s1
      .concat(s2)
      .filter(
        ({ id }, i, arr) => arr.findIndex((subj) => subj.id === id) === i
      );
  }
}
