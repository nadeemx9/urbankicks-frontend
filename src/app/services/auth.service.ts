import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080/api/auth'
  private afterLoginUrl = 'http://localhost:8080/api/user'

  // Subject to track login state
  private loggedIn = new BehaviorSubject<boolean>(this.checkLoginStatus());

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }


  authenticate(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/authenticate`, payload);
  }

  register(payload: any) {
    return this.http.post(`${this.baseUrl}/register`, payload)
  }
  storeToken(token: string): void {
    localStorage.setItem('token', token);
    this.loggedIn.next(true); // Set loggedIn to true when token is stored
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable(); // Observable to track login state
  }

  // Check if the user is logged in by checking if token exists
  checkLoginStatus(): boolean {
    return !!this.getToken(); // Synchronous check for token existence
  }

  logout(): void {
    localStorage.removeItem('token');
    this.loggedIn.next(false); // Update loggedIn state
    this.http.get(`${this.afterLoginUrl}/logout`).subscribe({})
  }
}