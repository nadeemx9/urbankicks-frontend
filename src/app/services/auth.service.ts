import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = 'http://localhost:8080/api/auth'

    // Subject to track login state
    private loggedIn = new BehaviorSubject<boolean>(this.checkLoginStatus());

  constructor(
    private http: HttpClient
  ) { }


  authenticate(payload: any) {
    return this.http.post(`${this.baseUrl}/authenticate`, payload)
  }

  // Function to store the token in localStorage
  storeToken(token: string) {
    localStorage.setItem('token', token);
    this.loggedIn.next(true); // Set loggedIn to true when token is stored
  }

  // Function to retrieve token from localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

   // Expose login state as an observable
   isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

    // Check if the user is logged in by checking token existence
    checkLoginStatus(): boolean {
      return !!this.getToken(); // Check if token exists in localStorage
    }

    // Function to log out the user
    logout() {
      localStorage.removeItem('token');
      this.loggedIn.next(false); // Set loggedIn to false after logging out
    }
}
