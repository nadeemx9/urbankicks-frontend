import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationExtras, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticatedUser } from '../../models/AuthenticatedUser';
import { AuthService } from '../../services/auth.service';
import { CommonService } from '../../services/common.service';
import { ModalComponent } from "../modal/modal.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ModalComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  brands: any[] = []
  categories: any[] = []
  genders: any[] = []

  subscription: Subscription = new Subscription

  authenticatedUser: AuthenticatedUser | null = null;

  isModalOpen: boolean = false;

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
      this.authService.getCurrentUser().subscribe(user => {
        this.authenticatedUser = user;
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
    this.closeModal();
    this.router.navigate(['login'], navigationExtras)
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
