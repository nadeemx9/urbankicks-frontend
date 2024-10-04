import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(): boolean {
    if (this.authService.checkLoginStatus()) {
      // If the user is logged in (token exists), allow access to the route
      return true;
    } else {
      // Redirect to login page if the user is not authenticated
      this.router.navigate(['/login']);
      return false;
    }
  }
}
