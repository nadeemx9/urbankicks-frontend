import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CommonService } from '../../services/common.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../../auth/auth.interceptor';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, OnDestroy {

  states: any[] = []
  districts: any[] = []

  registerForm: FormGroup;

  subscription: Subscription = new Subscription

  constructor(
    private titleService: Title,
    private commonService: CommonService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    titleService.setTitle('UrbanKicks - Register')

    this.registerForm = this.fb.group({
      fname: [''],
      lname: ['', Validators.required],
      email: ['', Validators.required],
      mobile: [null],
      password: ['', Validators.required],
      cpassword: ['', Validators.required],
      address: ['', Validators.required],
      stateId: ['', Validators.required],
      districtId: ['', Validators.required],
      city: ['', Validators.required],
      postal: ['', Validators.required]
    }, {
      validators: this.passwordsMatchValidator()
    });
  }


  ngOnInit(): void {
    this.goToTop()
    this.getStates();
  }


  register() {
    this.registerForm.markAllAsTouched();
    if (this.registerForm.valid) {
      const payload = this.registerForm.value;
      this.subscription.add(
        this.authService.register(payload).subscribe({
          next: (resp: any) => {
            console.log("Register Success >>>");
            this.router.navigate(['/login']);
          },
          error: (err: any) => {
            console.log(err);
            if (err?.error?.status === 400 && err?.error?.respCode === "VALIDATION_ERROR") {
              this.handleValidationErrors(err?.error?.errors);
            } else {
            }
          }
        })
      );
    } else this.focusFirstInvalidControl();
  }

  private handleValidationErrors(errors: any) {
    for (const field in errors) {
      if (errors.hasOwnProperty(field)) {
        const errorCode = errors[field];
        const control = this.registerForm.get(field);
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

  getStates() {
    this.subscription.add(
      this.commonService.getStates().subscribe({
        next: (resp: any) => {
          this.states = resp?.data
        },
        error: (err: any) => {
          console.error(err);
        }
      })
    );
  }

  getDistricts(stateId: any) {
    this.subscription.add(
      this.commonService.getDistricts(stateId).subscribe({
        next: (resp: any) => {
          this.districts = resp?.data
        },
        error: (err: any) => {
          console.error(err);
        }
      })
    );
  }
  onStateSelect(event: any) {
    const selectedStateId = event.target.value;
    this.districts = [];
    this.registerForm.get('districtId')?.setValue(''); // Resetting the districtId to default value
    if (selectedStateId) {
      this.getDistricts(selectedStateId);
    }
  }

  // Custom Validator for matching passwords
  passwordsMatchValidator(): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
      const password = formGroup.get('password')?.value;
      const confirmPassword = formGroup.get('cpassword')?.value;

      if (password && confirmPassword && password !== confirmPassword) {
        return { passwordsMismatch: true }; // Return an error object
      }
      return null; // Return null if passwords match
    };
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

  clearForm() {
    this.registerForm.markAsUntouched();
    this.registerForm.get('fname')?.setValue('')
    this.registerForm.get('lname')?.setValue('')
    this.registerForm.get('email')?.setValue('')
    this.registerForm.get('mobile')?.setValue('')
    this.registerForm.get('password')?.setValue('')
    this.registerForm.get('cpassword')?.setValue('')
    this.registerForm.get('address')?.setValue('')
    this.registerForm.get('stateId')?.setValue('')
    this.registerForm.get('districtId')?.setValue('')
    this.registerForm.get('city')?.setValue('')
    this.registerForm.get('postal')?.setValue('')
    this.goToTop();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
