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
      primaryImg: [null],
      img2: [null, imageValidator()],
      img3: [null, imageValidator()],
      img4: [null, imageValidator()],
      img5: [null, imageValidator()]
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

        // Ensure errorCode is a string and valid key for errorMessages
        const error = errorMessages[errorCode as keyof typeof errorMessages] || { unknownError: true };

        // Check if field belongs to productForm
        let control = this.productForm.get(field);
        if (!control) {
          // If not in productForm, check in imageForm
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
    this.productForm.get('collectionId')?.setValue(''); // Resetting the districtId to default value
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
      const controlName = fileInput.id; // Extracting the control name from the input's id

      // Set the file directly to the form control for validation
      // this.imageForm.get(controlName)?.setValue(file); // Store the file object
      this.imageForm.get(controlName)?.updateValueAndValidity(); // Trigger validation

      // Create a FileReader to read the image and show a preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews[index] = e.target.result; // Update the preview with the image data
      };
      reader.readAsDataURL(file); // Convert the file to a data URL
    } else {
      // If no file is selected (or dialog is closed without file)
      this.imagePreviews[index] = null; // Reset the preview to default "No file"
      this.imageForm.get(fileInput.id)?.setValue(null); // Clear the form control
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

// Define allowed extensions and max file size (50MB)
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Validator function
export function imageValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;

    // If no file is selected, return null (no error)
    if (!file) return null;

    // Ensure the value is a File object
    if (!(file instanceof File)) {
      console.log("INVALID FILE: Not a File instance");
      return { invalidFileType: true };
    }

    // Validate the file properties
    if (!file.name || typeof file.size !== 'number') {
      console.log("INVALID FILE: Missing name or size");
      return { invalidFileType: true };
    }

    // Check if file is empty (0 bytes)
    if (file.size === 0) {
      console.log("INVALID FILE: Blank file");
      return { blankFile: true };
    }

    // Check if file exceeds the maximum size
    if (file.size > MAX_FILE_SIZE) {
      console.log("INVALID FILE: File is too large");
      return { maxFileSize: true };
    }

    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension || '')) {
      console.log("INVALID FILE: Invalid file type");
      return { invalidFileType: true };
    }

    // Check for multiple extensions (more than one period in the file name)
    if (file.name.split('.').length > 2) {
      console.log("INVALID FILE: Multiple extensions");
      return { multipleExtensions: true };
    }

    return null; // No errors
  };
}



