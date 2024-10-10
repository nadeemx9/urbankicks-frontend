import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthenticatedUser } from '../models/AuthenticatedUser';
import { log } from 'node:console';
import e from 'express';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = 'http://localhost:8080/api/auth';
  private afterLoginUrl = 'http://localhost:8080/api/product';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  addProduct(formData: FormData): Observable<any> {
    return this.http.post(`${this.afterLoginUrl}/add-product`, formData);
  }
}
