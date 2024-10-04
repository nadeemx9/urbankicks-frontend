import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  brands: any[] = []
  categories: any[] = []
  genders: any[] = []

  subscription: Subscription = new Subscription

  isLoggedIn: boolean = false; // Track login state

  constructor(
    private titleService: Title,
    private commonService: CommonService,
    private authSerice: AuthService,
    private router: Router,
    private authService: AuthService
  ) {
    titleService.setTitle('UrbanKicks - Kick It!')
  }
  ngOnInit(): void {
    // Subscribe to login state changes
    this.subscription.add(
      this.authService.isLoggedIn().subscribe((loggedIn: boolean) => {
        this.isLoggedIn = loggedIn; // Update isLoggedIn property
      })
    );

    this.getBrands();
    this.getCategories();
    this.getGenders();
  }

  getBrands() {
    this.subscription.add(
      this.commonService.getBrands().subscribe({
        next: (resp: any) => {
          this.brands = resp?.data
        },
        error: (err: any) => {
          console.error(err);
        }
      })
    );
  }

  getCategories() {
    this.subscription.add(
      this.commonService.getCategories().subscribe({
        next: (resp: any) => {
          this.categories = resp?.data
        },
        error: (err: any) => {
          console.error(err);
        }
      })
    );
  }

  getGenders() {
    this.subscription.add(
      this.commonService.getGenders().subscribe({
        next: (resp: any) => {
          this.genders = resp?.data
        },
        error: (err: any) => {
          console.error(err);
        }
      })
    );
  }

  logout() {
    this.authSerice.logout();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
