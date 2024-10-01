import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { Subscription } from 'rxjs';
import { error, log } from 'console';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  subscription: Subscription = new Subscription;
  categoriesSectionData: any[] = [];

  constructor(
    private titleService: Title,
    private commonService: CommonService
  ) {
    titleService.setTitle('UrbanKicks - Kick It!')

  }
  ngOnInit(): void {
    this.getCategoriesSectionData();
  }

  getCategoriesSectionData() {
    this.subscription.add(
      this.commonService.getCategoriesSection().subscribe({
        next: (resp: any) => {
          this.categoriesSectionData = resp?.data
        },
        error: (err: any) => {
          console.log(err);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
