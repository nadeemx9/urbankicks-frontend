import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
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

  constructor(
    private titleService: Title,
    private commonService: CommonService
  ) {
    titleService.setTitle('UrbanKicks - Kick It!')

  }
  ngOnInit(): void {
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

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
