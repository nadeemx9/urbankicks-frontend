import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
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

  private unsubscribe$ = new Subject<void>(); // For unsubscribe

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
    this.loadDropdowns();
  }

  loadDropdowns() {
    this.commonService.getGenders().pipe(takeUntil(this.unsubscribe$)).subscribe((resp: any) => {
      this.genders = resp?.data;
    });
    this.commonService.getBrands().pipe(takeUntil(this.unsubscribe$)).subscribe((resp: any) => {
      this.brands = resp?.data;
    });
    this.commonService.getSizes().pipe(takeUntil(this.unsubscribe$)).subscribe((resp: any) => {
      this.sizes = resp?.data;
    });
    this.commonService.getColors().pipe(takeUntil(this.unsubscribe$)).subscribe((resp: any) => {
      this.colors = resp?.data;
    });
  }

  addProduct() {
    this.productForm.markAllAsTouched();
    if (this.productForm.valid) {

    } else {
      this.focusFirstInvalidControl();
      this.alert('danger', 'Please fill required fields');
    }
  }

  getCollectionsByBrand(brandId: any) {
    this.commonService.getCollectionsByBrand(brandId).pipe(takeUntil(this.unsubscribe$)).subscribe((resp: any) => {
      this.collections = resp?.data;
    });
  }

  onGenderSelect(event: any) {
    const selectedGenderId = event.target.value;
    this.productForm.get('categoryId')?.setValue(''); // Resetting the districtId to default value
    if (selectedGenderId) {
      this.commonService.getCategoriesByGender(selectedGenderId).pipe(takeUntil(this.unsubscribe$)).subscribe((resp: any) => {
        this.categories = resp?.data;
      });
    }
  }

  onBrandSelect(event: any) {
    const brandId = event.target.value;
    this.productForm.get('collectionId')?.setValue(''); // Resetting the districtId to default value
    if (brandId) {
      this.commonService.getCollectionsByBrand(brandId).pipe(takeUntil(this.unsubscribe$)).subscribe((resp: any) => {
        this.collections = resp?.data;
      });
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

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete(); // Cleanup
  }
}
