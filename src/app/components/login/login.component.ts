import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AlertComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup
  subscription: Subscription = new Subscription
  showAlert: boolean = false;
  alertType: string = ''; // 'success' or 'danger'
  alertMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private titleService: Title,
    private router: Router,
    private authService: AuthService
  ) {
    titleService.setTitle('UrbanKicks - Login')

    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    })

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state && navigation.extras.state['alert']) {
      const alert = navigation.extras.state['alert'];
      this.alert(alert?.type, alert?.message)
    }
  }

  ngOnInit(): void {
    this.goToTop()
  }

  onSubmit() {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      const payload = this.loginForm.value;
      this.subscription.add(
        this.authService.authenticate(payload).subscribe({
          next: (resp: any) => {
            this.authService.storeToken(resp.token);
            this.alert('success', 'Login Success')
            setTimeout(() => {
              this.router.navigate(['']);
            }, 1500);
          },
          error: (err: any) => {
            if (err?.error?.status === 400 && err?.error?.respCode === "VALIDATION_ERROR") {
              this.handleValidationErrors(err?.error?.errors);
            } else if (err?.error?.status === 401 && err?.error?.respCode === "BAD_CREDENTIALS") {
              this.alert('danger', 'Bad Credentials');
            } else
              console.log(err);
          }
        })
      );
    } else {
      this.focusFirstInvalidControl();
      this.alert('danger', 'Please fill required fields');
    }
  }

  private handleValidationErrors(errors: any) {
    for (const field in errors) {
      if (errors.hasOwnProperty(field)) {
        const errorCode = errors[field];
        const control = this.loginForm.get(field);
        if (control) {
          switch (errorCode) {
            case '101':
              control.setErrors({ required: true });
              break;
            case '102':
              control.setErrors({ required: true });
              break;
            default:
              control.setErrors({ unknownError: true });
          }
        }
      }
    }
  }

  alert(type: 'success' | 'danger', message: string) {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 2000);
    this.goToTop();
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
