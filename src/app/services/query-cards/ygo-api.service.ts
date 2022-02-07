import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { IQueryParams, IQueryConfig } from './query-params.interface';

const LIMIT_RESULTS = 30;
const OFFSET_RESULTS = 0;

@Injectable({
  providedIn: 'root',
})
export class YgoApiService {
  private readonly API_URL = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  query(query: IQueryParams, queryConfig?: IQueryConfig) {
    const params = this.getParams(query, queryConfig);
    return this.http.get(this.API_URL, { params });
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
    for (const [key, value] of Object.entries(query)) params[key] = value;

    return new HttpParams({ fromObject: params });
  }
}
