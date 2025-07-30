import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
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
                  
                  <div class="custom-form-field">
                    <label for="entity-name" class="field-label">Entity Name *</label>
                    <input 
                      id="entity-name"
                      type="text"
                      formControlName="name" 
                      placeholder="Enter legal entity name"
                      class="custom-input"
                      [class.error]="basicInfoForm.get('name')?.invalid && basicInfoForm.get('name')?.touched">
                    <div class="field-hint">Full legal name of the entity</div>
                    <div *ngIf="basicInfoForm.get('name')?.hasError('required') && basicInfoForm.get('name')?.touched" class="field-error">
                      Entity name is required
                    </div>
                    <div *ngIf="basicInfoForm.get('name')?.hasError('minlength') && basicInfoForm.get('name')?.touched" class="field-error">
                      Name must be at least 2 characters long
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="custom-form-field">
                      <label for="entity-type" class="field-label">Entity Type *</label>
                      <select 
                        id="entity-type"
                        formControlName="type" 
                        class="custom-select"
                        [class.error]="basicInfoForm.get('type')?.invalid && basicInfoForm.get('type')?.touched">
                        <option value="">Select entity type</option>
                        <option 
                          *ngFor="let type of entityTypes" 
                          [value]="type.value">
                          {{ type.label }}
                        </option>
                      </select>
                      <div *ngIf="basicInfoForm.get('type')?.hasError('required') && basicInfoForm.get('type')?.touched" class="field-error">
                        Entity type is required
                      </div>
                    </div>

                    <div class="custom-form-field">
                      <label for="registration-number" class="field-label">Registration Number *</label>
                      <input 
                        id="registration-number"
                        type="text"
                        formControlName="registrationNumber" 
                        placeholder="Enter registration number"
                        class="custom-input"
                        [class.error]="basicInfoForm.get('registrationNumber')?.invalid && basicInfoForm.get('registrationNumber')?.touched">
                      <div *ngIf="basicInfoForm.get('registrationNumber')?.hasError('required') && basicInfoForm.get('registrationNumber')?.touched" class="field-error">
                        Registration number is required
                      </div>
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="custom-form-field">
                      <label for="employee-count" class="field-label">Employee Count *</label>
                      <input 
                        id="employee-count"
                        type="number" 
                        formControlName="employeeCount" 
                        min="0"
                        placeholder="Number of employees"
                        class="custom-input"
                        [class.error]="basicInfoForm.get('employeeCount')?.invalid && basicInfoForm.get('employeeCount')?.touched">
                      <div *ngIf="basicInfoForm.get('employeeCount')?.hasError('required') && basicInfoForm.get('employeeCount')?.touched" class="field-error">
                        Employee count is required
                      </div>
                      <div *ngIf="basicInfoForm.get('employeeCount')?.hasError('min') && basicInfoForm.get('employeeCount')?.touched" class="field-error">
                        Employee count must be 0 or greater
                      </div>
                    </div>

                    <div class="custom-form-field">
                      <label for="entity-status" class="field-label">Status *</label>
                      <select 
                        id="entity-status"
                        formControlName="status" 
                        class="custom-select"
                        [class.error]="basicInfoForm.get('status')?.invalid && basicInfoForm.get('status')?.touched">
                        <option 
                          *ngFor="let status of entityStatuses" 
                          [value]="status.value">
                          {{ status.label }}
                        </option>
                      </select>
                    </div>
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
                  
                  <div class="custom-form-field full-width">
                    <label for="street-address" class="field-label">Street Address *</label>
                    <input 
                      id="street-address"
                      type="text"
                      formControlName="street" 
                      placeholder="Enter street address"
                      class="custom-input"
                      [class.error]="addressForm.get('street')?.invalid && addressForm.get('street')?.touched">
                    <div *ngIf="addressForm.get('street')?.hasError('required') && addressForm.get('street')?.touched" class="field-error">
                      Street address is required
                    </div>
                  </div>

                  <div class="form-row">
                    <div class="custom-form-field">
                      <label for="city" class="field-label">City *</label>
                      <input 
                        id="city"
                        type="text"
                        formControlName="city" 
                        placeholder="Enter city"
                        class="custom-input"
                        [class.error]="addressForm.get('city')?.invalid && addressForm.get('city')?.touched">
                      <div *ngIf="addressForm.get('city')?.hasError('required') && addressForm.get('city')?.touched" class="field-error">
                        City is required
                      </div>
                    </div>

                    <div class="custom-form-field">
                      <label for="postal-code" class="field-label">Postal Code *</label>
                      <input 
                        id="postal-code"
                        type="text"
                        formControlName="postalCode" 
                        placeholder="Enter postal code"
                        class="custom-input"
                        [class.error]="addressForm.get('postalCode')?.invalid && addressForm.get('postalCode')?.touched">
                      <div *ngIf="addressForm.get('postalCode')?.hasError('required') && addressForm.get('postalCode')?.touched" class="field-error">
                        Postal code is required
                      </div>
                    </div>
                  </div>

                  <div class="custom-form-field full-width">
                    <label for="country" class="field-label">Country *</label>
                    <input 
                      id="country"
                      type="text"
                      formControlName="country" 
                      placeholder="Enter country"
                      class="custom-input"
                      [class.error]="addressForm.get('country')?.invalid && addressForm.get('country')?.touched">
                    <div *ngIf="addressForm.get('country')?.hasError('required') && addressForm.get('country')?.touched" class="field-error">
                      Country is required
                    </div>
                  </div>
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
                    <div class="custom-form-field">
                      <label for="contact-name" class="field-label">Full Name *</label>
                      <input 
                        id="contact-name"
                        type="text"
                        formControlName="name" 
                        placeholder="Enter contact person name"
                        class="custom-input"
                        [class.error]="contactForm.get('name')?.invalid && contactForm.get('name')?.touched">
                      <div *ngIf="contactForm.get('name')?.hasError('required') && contactForm.get('name')?.touched" class="field-error">
                        Contact name is required
                      </div>
                    </div>

                    <div class="custom-form-field">
                      <label for="contact-position" class="field-label">Position *</label>
                      <input 
                        id="contact-position"
                        type="text"
                        formControlName="position" 
                        placeholder="Enter position/title"
                        class="custom-input"
                        [class.error]="contactForm.get('position')?.invalid && contactForm.get('position')?.touched">
                      <div *ngIf="contactForm.get('position')?.hasError('required') && contactForm.get('position')?.touched" class="field-error">
                        Position is required
                      </div>
                    </div>
                  </div>

                  <div class="custom-form-field full-width">
                    <label for="contact-email" class="field-label">Email Address *</label>
                    <input 
                      id="contact-email"
                      type="email" 
                      formControlName="email" 
                      placeholder="Enter email address"
                      class="custom-input"
                      [class.error]="contactForm.get('email')?.invalid && contactForm.get('email')?.touched">
                    <div *ngIf="contactForm.get('email')?.hasError('required') && contactForm.get('email')?.touched" class="field-error">
                      Email is required
                    </div>
                    <div *ngIf="contactForm.get('email')?.hasError('email') && contactForm.get('email')?.touched" class="field-error">
                      Please enter a valid email address
                    </div>
                  </div>

                  <div class="custom-form-field full-width">
                    <label for="contact-phone" class="field-label">Phone Number *</label>
                    <input 
                      id="contact-phone"
                      type="tel" 
                      formControlName="phone" 
                      placeholder="Enter phone number"
                      class="custom-input"
                      [class.error]="contactForm.get('phone')?.invalid && contactForm.get('phone')?.touched">
                    <div *ngIf="contactForm.get('phone')?.hasError('required') && contactForm.get('phone')?.touched" class="field-error">
                      Phone number is required
                    </div>
                  </div>
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
                    {{ isSubmitting ? 'Adding Entity...' : 'Add Legal Entity' }}
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
      background: linear-gradient(135deg, #9E7FFF 0%, #7c3aed 100%);
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
      color: #171717;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Custom Form Field Styling */
    .custom-form-field {
      margin-bottom: 20px;
      position: relative;
    }

    .field-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
      cursor: pointer;
    }

    .custom-input,
    .custom-select {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      font-family: 'Roboto', sans-serif;
      background-color: white;
      color: #1f2937;
      transition: all 0.2s ease;
      box-sizing: border-box;
      min-height: 48px;
      line-height: 1.5;
    }

    .custom-input:focus,
    .custom-select:focus {
      outline: none;
      border-color: #9E7FFF;
      box-shadow: 0 0 0 3px rgba(158, 127, 255, 0.1);
    }

    .custom-input:hover,
    .custom-select:hover {
      border-color: #9ca3af;
    }

    .custom-input.error,
    .custom-select.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .custom-input::placeholder {
      color: #9ca3af;
      opacity: 1;
    }

    .custom-select {
      cursor: pointer;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 12px center;
      background-repeat: no-repeat;
      background-size: 16px;
      padding-right: 40px;
      appearance: none;
    }

    .custom-select:focus {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239E7FFF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    }

    .field-hint {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }

    .field-error {
      font-size: 12px;
      color: #ef4444;
      margin-top: 4px;
      font-weight: 500;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 0;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 24px;
      border-top: 1px solid #e5e5e5;
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
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
      background-color: #9E7FFF;
    }

    ::ng-deep .mat-step-header .mat-step-icon-selected {
      background-color: #10b981;
    }

    ::ng-deep .mat-step-label {
      font-weight: 500;
    }

    /* Responsive Design */
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
        gap: 16px;
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

      .form-row {
        gap: 12px;
      }
    }

    /* Accessibility improvements */
    .custom-input:focus,
    .custom-select:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      .modal-overlay,
      .modal-container,
      .custom-input,
      .custom-select {
        transition: none;
      }
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .custom-input,
      .custom-select {
        border-width: 3px;
      }
      
      .custom-input:focus,
      .custom-select:focus {
        border-width: 3px;
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