import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../services/common.service';

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
    private fb: FormBuilder
  ) {
    titleService.setTitle('UrbanKicks - Register')

    this.registerForm = this.fb.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      email: ['', Validators.required],
      mobile: [''],
      password: ['', Validators.required],
      cpassword: ['', Validators.required],
      address: ['', Validators.required],
      stateId: [null, Validators.required],
      districtId: [null, Validators.required],
      city: ['', Validators.required],
      postal: ['', Validators.required]
    }, {
      validators: this.passwordsMatchValidator()
    });
  }

  register() {
    console.log(this.registerForm?.value);
    this.registerForm.markAllAsTouched();

    if (this.registerForm.valid) {

    } else this.focusFirstInvalidControl();
  }

  ngOnInit(): void {
    this.goToTop()
    this.getStates();
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
    this.registerForm.get('districtId')?.setValue(null); // Resetting the districtId to default value
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
    // this.registerForm.markAsUntouched();
    // this.registerForm.get('fname')?.setValue('')
    // this.registerForm.get('lname')?.setValue('')
    // this.registerForm.get('email')?.setValue('')
    // this.registerForm.get('mobile')?.setValue('')
    // this.registerForm.get('password')?.setValue('')
    // this.registerForm.get('cpassword')?.setValue('')
    // this.registerForm.get('address')?.setValue('')
    // this.registerForm.get('stateId')?.setValue('')
    // this.registerForm.get('districtId')?.setValue('')
    // this.registerForm.get('city')?.setValue('')
    // this.registerForm.get('postal')?.setValue('')

    this.registerForm.reset();
    this.goToTop();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
