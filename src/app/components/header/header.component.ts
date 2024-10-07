import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
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

  isLoggedIn: boolean = false;

  constructor(
    private titleService: Title,
    private commonService: CommonService,
    private router: Router,
    private authService: AuthService
  ) {
    titleService.setTitle('UrbanKicks - Kick It!')
  }
  ngOnInit(): void {
    this.subscription.add(
      this.authService.isLoggedIn().subscribe((loggedIn: boolean) => {
        this.isLoggedIn = loggedIn;
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
    this.authService.logout();
    const navigationExtras: NavigationExtras = {
      state: {
        alert: { type: 'warning', message: 'Logout Success' }
      }
    };
    this.router.navigate(['login'], navigationExtras)
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
