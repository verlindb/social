import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { CompanyService } from '../../services/company.service';
import { LegalEntity, LegalEntityType, EntityStatus } from '../../models/legal-entity.model';

@Component({
  selector: 'app-add-legal-entity-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatStepperModule
  ],
  template: `
    <div 
      class="modal-overlay" 
      [class.open]="isOpen"
      (click)="onOverlayClick($event)"
      role="dialog"
      [attr.aria-modal]="isOpen"
      [attr.aria-labelledby]="isOpen ? 'modal-title' : null"
      [attr.aria-hidden]="!isOpen">
      
      <div class="modal-container" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <h2 id="modal-title" class="modal-title">
            <mat-icon aria-hidden="true">add_business</mat-icon>
            Add Legal Entity
          </h2>
          <button 
            mat-icon-button 
            (click)="onClose()"
            class="close-button"
            aria-label="Close modal"
            matTooltip="Close">
            <mat-icon>close</mat-icon>
          </button>
        </header>

        <div class="modal-content">
          <mat-stepper 
            #stepper 
            [linear]="true" 
            orientation="horizontal"
            class="entity-stepper"
            [attr.aria-label]="'Add legal entity form steps'">
            
            <!-- Step 1: Basic Information -->
            <mat-step 
              [stepControl]="basicInfoForm" 
              label="Basic Information"
              [attr.aria-label]="'Step 1: Basic Information'">
              <form [formGroup]="basicInfoForm" class="step-form">
                <div class="form-section">
                  <h3 class="section-title">Entity Details</h3>
                  
                  <mat-form-field appearance="outline">
                    <mat-label>Entity Name</mat-label>
                    <input 
                      matInput 
                      formControlName="name" 
                      placeholder="Enter legal entity name"
                      aria-describedby="name-hint">
                    <mat-hint id="name-hint">Full legal name of the entity</mat-hint>
                    <mat-error *ngIf="basicInfoForm.get('name')?.hasError('required')">
                      Entity name is required
                    </mat-error>
                    <mat-error *ngIf="basicInfoForm.get('name')?.hasError('minlength')">
                      Name must be at least 2 characters long
                    </mat-error>
                  </mat-form-field>

                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Entity Type</mat-label>
                      <mat-select 
                        formControlName="type" 
                        aria-label="Select entity type">
                        <mat-option 
                          *ngFor="let type of entityTypes" 
                          [value]="type.value">
                          {{ type.label }}
                        </mat-option>
                      </mat-select>
                      <mat-error *ngIf="basicInfoForm.get('type')?.hasError('required')">
                        Entity type is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Registration Number</mat-label>
                      <input 
                        matInput 
                        formControlName="registrationNumber" 
                        placeholder="Enter registration number">
                      <mat-error *ngIf="basicInfoForm.get('registrationNumber')?.hasError('required')">
                        Registration number is required
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Employee Count</mat-label>
                      <input 
                        matInput 
                        type="number" 
                        formControlName="employeeCount" 
                        min="0"
                        placeholder="Number of employees">
                      <mat-error *ngIf="basicInfoForm.get('employeeCount')?.hasError('required')">
                        Employee count is required
                      </mat-error>
                      <mat-error *ngIf="basicInfoForm.get('employeeCount')?.hasError('min')">
                        Employee count must be 0 or greater
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Status</mat-label>
                      <mat-select 
                        formControlName="status" 
                        aria-label="Select entity status">
                        <mat-option 
                          *ngFor="let status of entityStatuses" 
                          [value]="status.value">
                          {{ status.label }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                  </div>
                </div>

                <div class="step-actions">
                  <button 
                    mat-raised-button 
                    color="primary" 
                    matStepperNext
                    [disabled]="basicInfoForm.invalid"
                    class="next-button">
                    <mat-icon aria-hidden="true">arrow_forward</mat-icon>
                    Next: Address
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 2: Address Information -->
            <mat-step 
              [stepControl]="addressForm" 
              label="Address"
              [attr.aria-label]="'Step 2: Address Information'">
              <form [formGroup]="addressForm" class="step-form">
                <div class="form-section">
                  <h3 class="section-title">Entity Address</h3>
                  
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Street Address</mat-label>
                    <input 
                      matInput 
                      formControlName="street" 
                      placeholder="Enter street address">
                    <mat-error *ngIf="addressForm.get('street')?.hasError('required')">
                      Street address is required
                    </mat-error>
                  </mat-form-field>

                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>City</mat-label>
                      <input 
                        matInput 
                        formControlName="city" 
                        placeholder="Enter city">
                      <mat-error *ngIf="addressForm.get('city')?.hasError('required')">
                        City is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Postal Code</mat-label>
                      <input 
                        matInput 
                        formControlName="postalCode" 
                        placeholder="Enter postal code">
                      <mat-error *ngIf="addressForm.get('postalCode')?.hasError('required')">
                        Postal code is required
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Country</mat-label>
                    <input 
                      matInput 
                      formControlName="country" 
                      placeholder="Enter country">
                    <mat-error *ngIf="addressForm.get('country')?.hasError('required')">
                      Country is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button 
                    mat-button 
                    matStepperPrevious
                    class="back-button">
                    <mat-icon aria-hidden="true">arrow_back</mat-icon>
                    Back
                  </button>
                  <button 
                    mat-raised-button 
                    color="primary" 
                    matStepperNext
                    [disabled]="addressForm.invalid"
                    class="next-button">
                    <mat-icon aria-hidden="true">arrow_forward</mat-icon>
                    Next: Contact
                  </button>
                </div>
              </form>
            </mat-step>

            <!-- Step 3: Contact Information -->
            <mat-step 
              [stepControl]="contactForm" 
              label="Contact Person"
              [attr.aria-label]="'Step 3: Contact Person Information'">
              <form [formGroup]="contactForm" class="step-form">
                <div class="form-section">
                  <h3 class="section-title">Contact Person</h3>
                  
                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Full Name</mat-label>
                      <input 
                        matInput 
                        formControlName="name" 
                        placeholder="Enter contact person name">
                      <mat-error *ngIf="contactForm.get('name')?.hasError('required')">
                        Contact name is required
                      </mat-error>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Position</mat-label>
                      <input 
                        matInput 
                        formControlName="position" 
                        placeholder="Enter position/title">
                      <mat-error *ngIf="contactForm.get('position')?.hasError('required')">
                        Position is required
                      </mat-error>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Email Address</mat-label>
                    <input 
                      matInput 
                      type="email" 
                      formControlName="email" 
                      placeholder="Enter email address">
                    <mat-error *ngIf="contactForm.get('email')?.hasError('required')">
                      Email is required
                    </mat-error>
                    <mat-error *ngIf="contactForm.get('email')?.hasError('email')">
                      Please enter a valid email address
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Phone Number</mat-label>
                    <input 
                      matInput 
                      type="tel" 
                      formControlName="phone" 
                      placeholder="Enter phone number">
                    <mat-error *ngIf="contactForm.get('phone')?.hasError('required')">
                      Phone number is required
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="step-actions">
                  <button 
                    mat-button 
                    matStepperPrevious
                    class="back-button">
                    <mat-icon aria-hidden="true">arrow_back</mat-icon>
                    Back
                  </button>
                  <button 
                    mat-raised-button 
                    color="primary" 
                    (click)="onSubmit()"
                    [disabled]="!isFormValid() || isSubmitting"
                    class="submit-button">
                    <mat-icon *ngIf="!isSubmitting" aria-hidden="true">save</mat-icon>
                    <mat-spinner *ngIf="isSubmitting" diameter="20" aria-hidden="true"></mat-spinner>
                    {{ isSubmitting ? 'Adding...' : 'Add Legal Entity' }}
                  </button>
                </div>
              </form>
            </mat-step>
          </mat-stepper>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      backdrop-filter: blur(4px);
    }

    .modal-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .modal-container {
      background: white;
      border-radius: 16px;
      width: 90vw;
      max-width: 800px;
      max-height: 90vh;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      transform: scale(0.9) translateY(20px);
      transition: all 0.3s ease;
    }

    .modal-overlay.open .modal-container {
      transform: scale(1) translateY(0);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 24px;
      background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
      color: white;
    }

    .modal-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .close-button {
      color: white;
    }

    .close-button:focus {
      outline: 2px solid white;
      outline-offset: 2px;
    }

    .modal-content {
      padding: 0;
      max-height: calc(90vh - 80px);
      overflow-y: auto;
    }

    .entity-stepper {
      background: transparent;
    }

    .step-form {
      padding: 32px;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: var(--text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 24px;
      border-top: 1px solid var(--border-color);
      gap: 16px;
    }

    .back-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .next-button,
    .submit-button {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-left: auto;
    }

    .submit-button {
      background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
      color: white;
    }

    /* Stepper customization */
    ::ng-deep .mat-stepper-horizontal {
      margin-top: 0;
    }

    ::ng-deep .mat-step-header {
      padding: 16px 24px;
    }

    ::ng-deep .mat-step-header .mat-step-icon {
      background-color: #38bdf8;
    }

    ::ng-deep .mat-step-header .mat-step-icon-selected {
      background-color: #0ea5e9;
    }

    ::ng-deep .mat-step-label {
      font-weight: 500;
    }

    /* CRITICAL: Force form field visibility and remove any blocking elements */
    .mat-mdc-form-field {
      width: 100% !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      position: relative !important;
      z-index: 10 !important;
      margin-bottom: 16px !important;
      min-height: 56px !important;
      background: transparent !important;
      pointer-events: auto !important;
    }

    .mat-mdc-form-field .mat-mdc-text-field-wrapper {
      width: 100% !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      background-color: #ffffff !important;
      border: 2px solid #d1d5db !important;
      border-radius: 8px !important;
      min-height: 56px !important;
      position: relative !important;
      z-index: 10 !important;
      pointer-events: auto !important;
      cursor: text !important;
    }

    .mat-mdc-input-element,
    input[matInput],
    textarea[matInput] {
      width: 100% !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      background-color: transparent !important;
      color: #1f2937 !important;
      font-size: 16px !important;
      padding: 16px 14px !important;
      border: none !important;
      outline: none !important;
      box-sizing: border-box !important;
      min-height: 24px !important;
      position: relative !important;
      z-index: 10 !important;
      pointer-events: auto !important;
      cursor: text !important;
    }

    /* Fix number input styling */
    input[type="number"][matInput] {
      -webkit-appearance: none !important;
      -moz-appearance: textfield !important;
      appearance: none !important;
    }

    input[type="number"][matInput]::-webkit-outer-spin-button,
    input[type="number"][matInput]::-webkit-inner-spin-button {
      -webkit-appearance: none !important;
      margin: 0 !important;
    }
    .mat-mdc-select {
      width: 100% !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      position: relative !important;
      z-index: 10 !important;
      pointer-events: auto !important;
      cursor: pointer !important;
    }

    .mat-mdc-select-trigger {
      width: 100% !important;
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      background-color: transparent !important;
      color: #1f2937 !important;
      font-size: 16px !important;
      padding: 16px 14px !important;
      min-height: 24px !important;
      position: relative !important;
      z-index: 10 !important;
      pointer-events: auto !important;
      cursor: pointer !important;
    }

    /* Fix select arrow visibility */
    .mat-mdc-select-arrow {
      visibility: visible !important;
      opacity: 1 !important;
      color: #6b7280 !important;
      pointer-events: none !important;
    }

    /* Ensure the entire form field is clickable */
    .mat-mdc-form-field-flex {
      width: 100% !important;
      display: flex !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      cursor: text !important;
      position: relative !important;
      z-index: 10 !important;
    }

    /* Make the label clickable to focus input */
    .mat-mdc-form-field-label {
      color: #6b7280 !important;
      font-size: 16px !important;
      visibility: visible !important;
      opacity: 1 !important;
      position: relative !important;
      z-index: 10 !important;
      pointer-events: auto !important;
      cursor: text !important;
    }

    /* Fix for select fields - make entire area clickable */
    .mat-mdc-form-field.mat-mdc-form-field-type-mat-select .mat-mdc-text-field-wrapper {
      cursor: pointer !important;
    }

    .mat-mdc-form-field.mat-mdc-form-field-type-mat-select .mat-mdc-form-field-flex {
      cursor: pointer !important;
    }
    }

    /* Remove any overlay or blocking elements */
    .mat-mdc-form-field::before,
    .mat-mdc-form-field::after {
      display: none !important;
    }


    /* Focus states */
    .mat-mdc-form-field.mat-focused .mat-mdc-text-field-wrapper {
      border-color: #9E7FFF !important;
      box-shadow: 0 0 0 3px rgba(158, 127, 255, 0.1) !important;
    }

    .mat-mdc-form-field.mat-focused .mat-mdc-form-field-label {
      color: #9E7FFF !important;
    }

    /* Hover states */
    .mat-mdc-form-field:hover .mat-mdc-text-field-wrapper {
      border-color: #9ca3af !important;
    }
    /* Remove Material outline that might be blocking */
    .mat-mdc-form-field-appearance-outline .mdc-notched-outline {
      display: none !important;
    }

    .mat-mdc-form-field-appearance-outline .mdc-notched-outline__leading,
    .mat-mdc-form-field-appearance-outline .mdc-notched-outline__notch,
    .mat-mdc-form-field-appearance-outline .mdc-notched-outline__trailing {
      display: none !important;
    }

    /* Ensure form field infix is properly sized and clickable */
    .mat-mdc-form-field-infix {
      width: 100% !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      position: relative !important;
      z-index: 10 !important;
      padding: 16px 14px !important;
      border: none !important;
      min-height: 24px !important;
    }

    /* Fix subscript wrapper */
    .mat-mdc-form-field-subscript-wrapper {
      visibility: visible !important;
      opacity: 1 !important;
      position: relative !important;
      z-index: 10 !important;
    }
    /* Ensure step content is not blocking form fields */
    .step-form {
      position: relative !important;
      z-index: 1 !important;
    }

    .form-section {
      position: relative !important;
      z-index: 1 !important;
    }

    /* CRITICAL: Override any global styles that might be blocking inputs */
    .mat-mdc-form-field * {
      pointer-events: auto !important;
    }

    /* Force input elements to be editable */
    input[matInput]:disabled,
    textarea[matInput]:disabled,
    .mat-mdc-select:disabled {
      pointer-events: none !important;
    }

    input[matInput]:not(:disabled),
    textarea[matInput]:not(:disabled) {
      pointer-events: auto !important;
      user-select: text !important;
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
    }

    /* Ensure form controls are not readonly */
    .mat-mdc-input-element:not([readonly]) {
      background-color: white !important;
      cursor: text !important;
    }

    /* Fix any potential overlay issues */
    .modal-content * {
      pointer-events: auto !important;
    }

    /* Ensure stepper content doesn't block inputs */
    ::ng-deep .mat-step-content {
      overflow: visible !important;
      position: relative !important;
      z-index: 1 !important;
    }

    ::ng-deep .mat-stepper-horizontal .mat-step-content {
      overflow: visible !important;
    }

    /* Force Material form field wrapper to be interactive */
    ::ng-deep .mat-mdc-text-field-wrapper {
      pointer-events: auto !important;
      position: relative !important;
      z-index: 10 !important;
    }

    ::ng-deep .mat-mdc-form-field-infix {
      pointer-events: auto !important;
      position: relative !important;
      z-index: 10 !important;
    }

    /* Ensure input elements receive focus and input */
    ::ng-deep input[matInput],
    ::ng-deep textarea[matInput] {
      pointer-events: auto !important;
      user-select: text !important;
      cursor: text !important;
      position: relative !important;
      z-index: 15 !important;
    }

    /* Fix select dropdown */
    ::ng-deep .mat-mdc-select {
      pointer-events: auto !important;
      cursor: pointer !important;
      position: relative !important;
      z-index: 15 !important;
    }

    ::ng-deep .mat-mdc-select-trigger {
      pointer-events: auto !important;
      cursor: pointer !important;
    }

    @media (max-width: 768px) {
      .modal-container {
        width: 95vw;
        max-height: 95vh;
      }

      .modal-header {
        padding: 16px;
      }

      .modal-title {
        font-size: 1.25rem;
      }

      .step-form {
        padding: 24px 16px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .step-actions {
        flex-direction: column;
        gap: 12px;
      }

      .next-button,
      .submit-button {
        margin-left: 0;
        width: 100%;
      }

      ::ng-deep .mat-stepper-horizontal {
        flex-direction: column;
      }

      ::ng-deep .mat-horizontal-stepper-header-container {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .modal-container {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
      }

      .step-form {
        padding: 16px;
      }
    }
  `]
})
export class AddLegalEntityModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() entityAdded = new EventEmitter<LegalEntity>();

  basicInfoForm!: FormGroup;
  addressForm!: FormGroup;
  contactForm!: FormGroup;

  isSubmitting = false;

  entityTypes = [
    { value: LegalEntityType.CORPORATION, label: 'Corporation' },
    { value: LegalEntityType.LLC, label: 'Limited Liability Company' },
    { value: LegalEntityType.PARTNERSHIP, label: 'Partnership' },
    { value: LegalEntityType.SUBSIDIARY, label: 'Subsidiary' },
    { value: LegalEntityType.BRANCH, label: 'Branch Office' },
    { value: LegalEntityType.DIVISION, label: 'Division' }
  ];

  entityStatuses = [
    { value: EntityStatus.ACTIVE, label: 'Active' },
    { value: EntityStatus.INACTIVE, label: 'Inactive' },
    { value: EntityStatus.PENDING, label: 'Pending' },
    { value: EntityStatus.SUSPENDED, label: 'Suspended' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    // Handle escape key
    document.addEventListener('keydown', this.handleEscapeKey.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue) {
      this.resetForms();
    }
  }

  private initializeForms(): void {
    this.basicInfoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      employeeCount: ['', [Validators.required, Validators.min(0)]],
      status: [EntityStatus.ACTIVE, Validators.required]
    });

    this.addressForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required]
    });

    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      position: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }

  private resetForms(): void {
    this.basicInfoForm.reset({
      status: EntityStatus.ACTIVE
    });
    this.addressForm.reset();
    this.contactForm.reset();
    this.isSubmitting = false;
  }

  isFormValid(): boolean {
    return this.basicInfoForm.valid && this.addressForm.valid && this.contactForm.valid;
  }

  onSubmit(): void {
    if (!this.isFormValid() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const basicInfo = this.basicInfoForm.value;
    const address = this.addressForm.value;
    const contact = this.contactForm.value;

    const newEntity: Omit<LegalEntity, 'id' | 'createdAt' | 'updatedAt'> = {
      name: basicInfo.name,
      type: basicInfo.type,
      registrationNumber: basicInfo.registrationNumber,
      employeeCount: basicInfo.employeeCount,
      status: basicInfo.status,
      address: {
        street: address.street,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country
      },
      contactPerson: {
        name: contact.name,
        position: contact.position,
        email: contact.email,
        phone: contact.phone
      }
    };

    this.companyService.addLegalEntity(newEntity)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: (entity) => {
          this.entityAdded.emit(entity);
        },
        error: (error) => {
          console.error('Error adding legal entity:', error);
          // Error handling would be done by parent component
        }
      });
  }

  onClose(): void {
    if (!this.isSubmitting) {
      this.closeModal.emit();
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.isSubmitting) {
      this.onClose();
    }
  }

  private handleEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen && !this.isSubmitting) {
      this.onClose();
    }
  }
}