import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080/api/auth'

  constructor(
    private http: HttpClient
  ) { }


  authenticate(payload: any) {
    return this.http.post(`${this.baseUrl}/authenticate`, payload)
  }

  // Function to store the token in localStorage
  storeToken(token: string) {
    localStorage.setItem('token', token);
  }

  // Function to retrieve token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Function to check if the user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken(); // returns true if token exists
  }

  // Function to log out the user
  logout() {
    localStorage.removeItem('token');
  }
}
