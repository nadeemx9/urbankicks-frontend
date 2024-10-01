import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private baseUrl = 'http://localhost:8080/api/common'

  constructor(
    private http: HttpClient
  ) {}

  getBrands() {
    return this.http.get(`${this.baseUrl}/get-brands-dropdown`);
  }

  getCategories() {
    return this.http.get(`${this.baseUrl}/get-categories-dropdown`);
  }

  getGenders() {
    return this.http.get(`${this.baseUrl}/get-genders`);
  }
}
