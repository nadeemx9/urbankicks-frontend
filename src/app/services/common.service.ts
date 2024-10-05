import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private baseUrl = 'http://localhost:8080/api/common'

  constructor(
    private http: HttpClient
  ) { }

  getBrands() {
    return this.http.get(`${this.baseUrl}/get-brands-dropdown`);
  }

  getCategories() {
    return this.http.get(`${this.baseUrl}/get-categories-dropdown`);
  }

  getCategoriesSection() {
    return this.http.get(`${this.baseUrl}/get-categories-section`);
  }

  getGenders() {
    return this.http.get(`${this.baseUrl}/get-genders`);
  }

  getCountries() {
    return this.http.get(`${this.baseUrl}/get-countries`);
  }

  getStates() {
    return this.http.get(`${this.baseUrl}/get-states`);
  }

  getDistricts(stateId: any) {
    return this.http.get(`${this.baseUrl}/get-districts/${stateId}`);
  }
}
