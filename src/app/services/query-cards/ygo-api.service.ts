import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { IQueryParams } from './query-params.interface';

@Injectable({
  providedIn: 'root',
})
export class YgoApiService {
  private readonly API_URL = environment.apiUrl;

  constructor(private readonly http: HttpClient) { }

  query(query: IQueryParams) {
    const params = this.getParams(query);
    return this.http.get(this.API_URL, { params });
  }

  private getParams(query: IQueryParams): HttpParams {
    const params: { [param: string]: string | number | boolean | readonly (string | number | boolean)[] } = {};

    for (const [key, value] of Object.entries(query))
      params[key] = value;

    return new HttpParams({ fromObject: params });
  }
}
