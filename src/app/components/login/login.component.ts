import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, RequiredValidator, Validators } from '@angular/forms';
import { BrowserModule, Title } from '@angular/platform-browser';
import { Router, RouterModule, Routes } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';



interface NavigationState {
  message?: string;  // Optional message property
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup
  subscription: Subscription = new Subscription

  showToast: boolean = true;
  message = 'Logged out success!';

  constructor(
    private fb: FormBuilder,
    private titleService: Title,
    private router: Router,
    private authService: AuthService
  ) {
    titleService.setTitle('UrbanKicks - Login')

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      const payload = this.loginForm?.value
      this.subscription.add(
        this.authService.authenticate(payload).subscribe({
          next: (resp: any) => {
            this.authService.storeToken(resp.token);  // Store the token
            this.router.navigate([''])
          },
          error: (err: any) => {
            console.log(err);
          }
        })
      );
      // this.router.navigate(['']);
    } else this.focusFirstInvalidControl();
  }

  ngOnInit(): void {
  }

  private focusFirstInvalidControl(): void {
    const invalidControl = document.querySelector('.ng-invalid[formControlName]') as HTMLElement;
    if (invalidControl) {
      invalidControl.focus();
    }
    this.goToTop();
  }

  goToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
