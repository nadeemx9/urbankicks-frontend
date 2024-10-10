import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CommonService } from '../../services/common.service';
import { AlertComponent } from '../alert/alert.component';
import { ProductService } from '../../services/product.service';

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

  imagePreviews: (string | null)[] = [null, null, null, null, null];


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
      primaryImg: ['']
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
            case '103':
              control.setErrors({ invalidFileType: true });
              break;
            case '104':
              control.setErrors({ maxFileSize: true });
              break;
            case '105':
              control.setErrors({ multipleExtentions: true });
              break;
            default:
              control.setErrors({ unknownError: true });
          }
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
    this.productForm.get('collectionId')?.setValue(''); // Resetting the districtId to default value
    if (brandId) {
      this.commonService.getCollectionsByBrand(brandId).pipe(takeUntil(this.unsubscribe$)).subscribe((resp: any) => {
        this.collections = resp?.data;
      });
    } else this.collections = []
  }
  onFileSelected(event: any, index: number): void {
    const fileInput = event.target;
    const file = fileInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews[index] = e.target.result; // Update the preview with the image data
      };
      reader.readAsDataURL(file); // Convert the file to a data URL
    } else {
      // If no file is selected (or dialog is closed without file)
      this.imagePreviews[index] = null; // Reset the preview to default "No file"
      fileInput.value = ''; // Reset the input field value so that the same file can be selected again if needed
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
