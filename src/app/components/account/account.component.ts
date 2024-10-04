import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit, OnDestroy {

  subscription: Subscription = new Subscription

  constructor(
    private titleService: Title,
    private authService: AuthService,
    private router: Router
  ) {
    titleService.setTitle('UrbanKicks - Account')
  }
  ngOnInit(): void {
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {

  }

}
