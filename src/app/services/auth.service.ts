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
export class AuthService {

  private baseUrl = 'http://localhost:8080/api/auth';
  private afterLoginUrl = 'http://localhost:8080/api/user';

  // Subject to track the current user and login state
  private currentUserSubject = new BehaviorSubject<AuthenticatedUser | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromToken();
  }

  // Authenticate user and fetch user details
  authenticate(payload: any): Observable<any> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/authenticate`, payload).pipe(
      tap(response => {
        if (response.token) {
          this.storeToken(response.token);
          this.fetchUserDetails(); // Fetch user details after login
        }
      })
    );
  }

  register(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, payload);
  }

  storeToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if the user is logged in based on the current user
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.getValue(); // Synchronous check for user existence
  }

  logout(): void {
    this.http.get(`${this.afterLoginUrl}/logout`).subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.currentUserSubject.next(null); // Clear the current user
        this.router.navigate(['/login']); // Navigate to login page
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  // Fetch user details from the server
  fetchUserDetails(): void {
    this.http.get<AuthenticatedUser>(`${this.afterLoginUrl}/me`).subscribe({
      next: user => {
        this.currentUserSubject.next(user); // Update current user state
      },
      error: (err: any) => {
        console.log('error while fetchUserDetails() >>>' + err);
        this.currentUserSubject.next(null); // Handle error, clear user
      }
    });
  }

  // Expose current user as an observable
  getCurrentUser(): Observable<AuthenticatedUser | null> {
    return this.currentUserSubject.asObservable();
  }

  // Restore user from token after page reload
  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      this.fetchUserDetails(); // Fetch user details if token exists
    }
  }
}
