import { AuthService } from './../services/auth.service';
import { HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import {jwtDecode} from 'jwt-decode';  // Correct import

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor {

  constructor(private router: Router,
    private authService : AuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandlerFn) {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage

    if (token && !this.isTokenExpired(token)) {
      const clonedRequest = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next(clonedRequest);
    } else if (token && this.isTokenExpired(token)) {
      // If token is expired, remove it and redirect to login
      localStorage.removeItem('token');
      this.router.navigate(['/login']);  // Navigate to login page
      return next(req);
    }

    return next(req);
  }

  // Function to check if the token is expired
  public isTokenExpired(token: string): boolean {
    const decoded: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;  // Return true if the token has expired
  }
}

// Define a function that can be passed as an interceptor
export const authInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const token = localStorage.getItem('token'); // Retrieve token from localStorage
  const router = new Router(); // Create a router instance

  if (token && !AuthInterceptor.prototype.isTokenExpired.call(null, token)) {
    const clonedRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedRequest);
  } else if (token && AuthInterceptor.prototype.isTokenExpired.call(null, token)) {
    // If token is expired, remove it and redirect to login
    localStorage.removeItem('token');
    router.navigate(['/login']);  // Navigate to login page
  }

  return next(req);
};
