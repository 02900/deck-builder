import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ICard } from '@components/card/card.interface';
import { IQueryParams, IQueryConfig, IQueryResult } from './query.interface';
import { map, Observable } from 'rxjs';

const LIMIT_RESULTS = 30;
const OFFSET_RESULTS = 0;

@Injectable({
  providedIn: 'root',
})
export class YgoApiService {
  private readonly API_URL = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  query(query: IQueryParams, queryConfig?: IQueryConfig): Observable<ICard[]> {
    const params = this.getParams(query, queryConfig);
    return this.http
      .get<IQueryResult>(this.API_URL, { params })
      .pipe(map((results: IQueryResult) => results.data));
  }

  private getParams(
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
}
