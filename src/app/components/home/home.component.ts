import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { CommonService } from '../../services/common.service';
import { Subscription } from 'rxjs';
import { error, log } from 'console';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  subscription: Subscription = new Subscription

  constructor(
    private titleService: Title,
    private commonService: CommonService
  ) {
    titleService.setTitle('UrbanKicks - Kick It!')

  }
  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
