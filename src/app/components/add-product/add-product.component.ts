import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { AlertComponent } from '../alert/alert.component';
import { ProductService } from '../../services/product.service';
import { json } from 'stream/consumers';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss'
})
export class AddProductComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>(); // For unsubscribe

  brands: any[] = [];
  categories: any[] = [];
  genders: any[] = [];
  collections: any[] = [];
  sizes: any[] = [];
  colors: any[] = [];

  showAlert = false;
  alertType = '';
  alertMessage = '';

  productForm: FormGroup;
  imageForm: FormGroup;

  imagePreviews: (string | null)[] = Array(5).fill(null); // Pre-fill with nulls
  selectedFiles: (File | null)[] = Array(5).fill(null); // Pre-fill with nulls

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private productService: ProductService
  ) {
    this.productForm = this.createProductForm();
    this.imageForm = this.createImageForm();
  }

  ngOnInit(): void {
    this.goToTop();
    this.loadDropdowns();
  }

  private createProductForm(): FormGroup {
    return this.fb.group({
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
    });
  }

  private createImageForm(): FormGroup {
    return this.fb.group({
      primaryImg: ['', Validators.required],
      img2: [''],
      img3: [''],
      img4: [''],
      img5: [''],
    });
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

  addProduct(): void {
    this.productForm.markAllAsTouched();
    this.imageForm.markAllAsTouched();
    if (this.productForm.valid) {
      const formData = this.buildFormData();

      this.productService.addProduct(formData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => this.alert('success', 'Product added successfully.'),
          error: (err) => this.handleProductError(err),
        });
    } else {
      this.focusFirstInvalidControl();
      this.alert('danger', 'Please fill required fields');
    }
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    formData.append('productPayload', JSON.stringify(this.productForm.value));

    // Append primary image
    const primaryImgFile = (document.getElementById('primaryImg') as HTMLInputElement)?.files?.[0];
    if (primaryImgFile) {
      formData.append('primaryImg', primaryImgFile);
    } else {
      console.error('Primary image is missing');
    }

    // Append other images
    for (let i = 2; i <= 5; i++) {
      const imgFile = (document.getElementById(`img${i}`) as HTMLInputElement)?.files?.[0];
      if (imgFile) {
        formData.append(`img${i}`, imgFile);
      }
    }
    return formData;
  }

  private handleProductError(err: any): void {
    if (err?.error?.status === 400 && err?.error?.respCode === "VALIDATION_ERROR") {
      this.handleValidationErrors(err?.error?.errors);
    } else {
      console.error(err);
    }
  }

  private handleValidationErrors(errors: { [key: string]: string }): void {
    const errorMessages: { [key: string]: any } = {
      '101': { required: true },
      '102': { required: true },
      '103': { invalidFileType: true },
      '104': { maxFileSize: true },
      '105': { multipleExtensions: true },
      '106': { blankFile: true },
      '107': { required: true }
    };

    Object.entries(errors).forEach(([field, errorCode]) => {
      const error = errorMessages[errorCode] || { unknownError: true };
      const control = this.productForm.get(field) || this.imageForm.get(field);
      if (control) {
        control.setErrors(error);
      } else {
        console.error('Invalid field name:', field);
      }
    });
  }

  getCollectionsByBrand(brandId: any): void {
    this.commonService.getCollectionsByBrand(brandId).pipe(takeUntil(this.unsubscribe$)).subscribe((resp: any) => {
      this.collections = resp?.data || [];
    });
  }

  onGenderSelect(event: Event): void {
    const selectedGenderId = (event.target as HTMLSelectElement).value;
    this.productForm.get('categoryId')?.setValue('');
    if (selectedGenderId) {
      this.commonService.getCategoriesByGender(selectedGenderId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((resp: any) => {
          this.categories = resp?.data || [];
        });
    } else {
      this.categories = [];
    }
  }

  onBrandSelect(event: Event): void {
    const brandId = (event.target as HTMLSelectElement).value;
    this.productForm.get('collectionId')?.setValue('');
    if (brandId) {
      this.commonService.getCollectionsByBrand(brandId).pipe(takeUntil(this.unsubscribe$)).subscribe((resp: any) => {
        this.collections = resp?.data || [];
      });
    } else {
      this.collections = [];
    }
  }

  onFileSelected(event: Event, index: number): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (file) {
      this.selectedFiles[index] = file;
      if (!this.validateFile(file, fileInput.id, index)) return;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews[index] = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.resetFileInput(fileInput, index);
    }
  }

  private resetFileInput(fileInput: HTMLInputElement, index: number): void {
    this.imagePreviews[index] = null;
    this.selectedFiles[index] = null;
    this.imageForm.get(fileInput.id)?.setValue(null);
    fileInput.value = '';
  }

  validateFile(file: File, controlName: string, index: number): boolean {
    this.imageForm.get(controlName)?.setErrors(null);

    const fileSizeMB = file.size / (1024 * 1024);
    const fileNameParts = file.name.split('.');
    const fileExtension = `.${fileNameParts.pop()?.toLowerCase()}`;

    const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
    const MAX_FILE_SIZE = 10;

    if (file.size === 0) {
      this.setFileError(controlName, 'blankFile', index);
      return false;
    } else if (fileNameParts.length > 1) {
      this.setFileError(controlName, 'multipleExtensions', index);
      return false;
    } else if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      this.setFileError(controlName, 'invalidFileType', index);
      return false;
    } else if (fileSizeMB > MAX_FILE_SIZE) {
      this.setFileError(controlName, 'maxFileSize', index);
      return false;
    }
    return true;
  }

  setFileError(controlName: string, errorType: string, index: number): void {
    const control = this.imageForm.get(controlName);
    if (control) {
      control.setErrors({ [errorType]: true });
      this.imagePreviews[index] = null;
      this.selectedFiles[index] = null;
    }
  }

  private focusFirstInvalidControl(): void {
    const invalidControl = document.querySelector('.ng-invalid[formControlName]') as HTMLElement;
    if (invalidControl) {
      invalidControl.focus();
    }
    this.goToTop();
  }

  alert(type: 'success' | 'danger', message: string): void {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 2000);
    this.goToTop();
  }

  goToTop(): void {
    window.scroll({ top: 0, left: 0, behavior: 'smooth' });
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
    this.unsubscribe$.complete();
  }
}




