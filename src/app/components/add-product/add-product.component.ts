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
  imageForm: FormGroup


  imagePreviews: (string | null)[] = [null, null, null, null, null];
  selectedFiles: (File | null)[] = [null, null, null, null, null]; // Allow null values


  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private productService: ProductService
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

    this.imageForm = this.fb.group({
      primaryImg: ['', Validators.required],
      img2: [''],
      img3: [''],
      img4: [''],
      img5: ['']
    })
  }

  ngOnInit(): void {
    this.goToTop()
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
    this.imageForm.markAllAsTouched();
    if (this.productForm.valid) {

      const formData = new FormData();

      // Convert the productForm to JSON string
      const productJson = JSON.stringify(this.productForm.value);
      formData.append('productPayload', productJson);

      // Identify primary image
      const primaryImgInput = document.getElementById('primaryImg') as HTMLInputElement;
      const primaryImgFile = primaryImgInput?.files?.[0];

      if (primaryImgFile) {
        formData.append('primaryImg', primaryImgFile);
      } else {
        console.error('Primary image is missing');
      }

      // Append other images
      for (let i = 2; i <= 5; i++) {
        const imgInput = document.getElementById(`img${i}`) as HTMLInputElement;
        const imgFile = imgInput?.files?.[0];

        if (imgFile) {
          formData.append(`img${i}`, imgFile);
        }
      }

      // Now send formData to your backend service
      this.productService.addProduct(formData)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (response: any) => {
            console.log("Product Added");
          },
          error: (err: any) => {
            if (err?.error?.status === 400 && err?.error?.respCode === "VALIDATION_ERROR") {
              this.handleValidationErrors(err?.error?.errors);
            } else console.log(err);
          }
        });

    } else {
      this.focusFirstInvalidControl();
      this.alert('danger', 'Please fill required fields');
    }
  }

  private handleValidationErrors(errors: { [key: string]: string }) {
    const errorMessages: { [key: string]: any } = {
      '101': { required: true },
      '102': { required: true },
      '103': { invalidFileType: true },
      '104': { maxFileSize: true },
      '105': { multipleExtensions: true },
      '106': { blankFile: true },
      '107': { required: true }
    };

    for (const field in errors) {
      if (errors.hasOwnProperty(field)) {
        const errorCode = errors[field];
        const error = errorMessages[errorCode as keyof typeof errorMessages] || { unknownError: true };
        let control = this.productForm.get(field);
        if (!control) {
          control = this.imageForm.get(field);
        }
        if (control) {
          control.setErrors(error);
        } else {
          console.error('Invalid field name:', field);
        }
      }
    }
  }

  getCollectionsByBrand(brandId: any) {
    this.commonService.getCollectionsByBrand(brandId).pipe(takeUntil(this.unsubscribe$)).subscribe((resp: any) => {
      this.collections = resp?.data;
    });
  }

  onGenderSelect(event: any) {
    const selectedGenderId = event.target.value;
    this.productForm.get('categoryId')?.setValue('');
    if (selectedGenderId) {
      this.commonService.getCategoriesByGender(selectedGenderId).pipe(takeUntil(this.unsubscribe$)).subscribe((resp: any) => {
        this.categories = resp?.data;
      });
    } else this.categories = []
  }

  onBrandSelect(event: any) {
    const brandId = event.target.value;
    this.productForm.get('collectionId')?.setValue('');
    if (brandId) {
      this.commonService.getCollectionsByBrand(brandId).pipe(takeUntil(this.unsubscribe$)).subscribe((resp: any) => {
        this.collections = resp?.data;
      });
    } else this.collections = []
  }


  onFileSelected(event: Event, index: number): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (file) {
      const controlName = fileInput.id;
      this.selectedFiles[index] = file;
      if (!this.validateFile(file, controlName, index)) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews[index] = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.imagePreviews[index] = null;
      this.selectedFiles[index] = null;
      this.imageForm.get(fileInput.id)?.setValue(null);
      fileInput.value = '';
    }
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
    this.unsubscribe$.complete();
  }
}




