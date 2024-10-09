import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss'
})
export class AddProductComponent implements OnInit, OnDestroy {

  subscription: Subscription = new Subscription

  brands: any[] = []
  categories: any[] = []
  genders: any[] = []
  collections: any[] = []
  sizes: any[] = []
  colors: any[] = []

  showAlert: boolean = false;
  alertType: string = '';
  alertMessage: string = '';

  productForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
  ) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      brandId: ['', Validators.required],
      collectionId: [''],
      categoryId: ['', Validators.required],
      genderId: ['', Validators.required],
      sizeId: ['', Validators.required],
      colorId: ['', Validators.required],
      basePrice: ['', Validators.required],
      quantity: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    this.goToTop()
    this.getBrands();
    this.getGenders();
    this.getColors();
    this.getSizes();
  }

  addProduct() {
    this.productForm.markAllAsTouched();
    if (this.productForm.valid) {

    } else {
      this.focusFirstInvalidControl();
      this.alert('danger', 'Please fill required fields');
    }
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

  getCategoriesByGender(genderId: any) {
    this.subscription.add(
      this.commonService.getCategoriesByGender(genderId).subscribe({
        next: (resp: any) => {
          this.categories = resp?.data
        },
        error: (err: any) => {
          console.error(err);
        }
      })
    );
  }

  getCollectionsByBrand(brandId: any) {
    this.subscription.add(
      this.commonService.getCollectionsByBrand(brandId).subscribe({
        next: (resp: any) => {
          this.collections = resp?.data
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

  getColors() {
    this.subscription.add(
      this.commonService.getColors().subscribe({
        next: (resp: any) => {
          this.colors = resp?.data
        },
        error: (err: any) => {
          console.error(err);
        }
      })
    );
  }

  getSizes() {
    this.subscription.add(
      this.commonService.getSizes().subscribe({
        next: (resp: any) => {
          this.sizes = resp?.data
        },
        error: (err: any) => {
          console.error(err);
        }
      })
    );
  }

  onGenderSelect(event: any) {
    const selectedGenderId = event.target.value;
    this.productForm.get('categoryId')?.setValue(''); // Resetting the districtId to default value
    if (selectedGenderId) {
      this.getCategoriesByGender(selectedGenderId);
    }
  }

  onBrandSelect(event: any) {
    const brandId = event.target.value;
    this.productForm.get('collectionId')?.setValue(''); // Resetting the districtId to default value
    if (brandId) {
      this.getCollectionsByBrand(brandId);
    }
  }

  private handleValidationErrors(errors: any) {
    for (const field in errors) {
      if (errors.hasOwnProperty(field)) {
        const errorCode = errors[field];
        const control = this.productForm.get(field);
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

  private focusFirstInvalidControl(): void {
    const invalidControl = document.querySelector('.ng-invalid[formControlName]') as HTMLElement;
    if (invalidControl) {
      invalidControl.focus();
    }
    this.goToTop();
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

  goToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  clearForm() {
    this.productForm.markAsUntouched();
    this.productForm.get('productName')?.setValue('');
    this.productForm.get('title')?.setValue('');
    this.productForm.get('description')?.setValue('');
    this.productForm.get('brandId')?.setValue('');
    this.productForm.get('collectionId')?.setValue('');
    this.productForm.get('categoryId')?.setValue('');
    this.productForm.get('genderId')?.setValue('');
    this.productForm.get('sizeId')?.setValue('');
    this.productForm.get('colorId')?.setValue('');
    this.productForm.get('basePrice')?.setValue('');
    this.productForm.get('quantity')?.setValue('');
    this.goToTop();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
