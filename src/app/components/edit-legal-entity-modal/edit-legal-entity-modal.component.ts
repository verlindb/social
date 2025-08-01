import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { CompanyService } from '../../services/company.service';
import { LegalEntity, LegalEntityType, EntityStatus } from '../../models/legal-entity.model';

@Component({
  selector: 'app-edit-legal-entity-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
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
            <span class="icon">✏️</span>
            Edit Legal Entity
          </h2>
          <button 
            (click)="onClose()"
            class="close-button"
            aria-label="Close modal"
            type="button">
            ✕
          </button>
        </header>

        <div class="modal-content">
          <!-- Custom Stepper Header -->
          <div class="stepper-header">
            <div class="step-indicator" [class.active]="currentStep === 1" [class.completed]="currentStep > 1">
              <div class="step-number">
                <span *ngIf="currentStep > 1">✓</span>
                <span *ngIf="currentStep <= 1">1</span>
              </div>
              <span class="step-label">Basic Info</span>
            </div>
            <div class="step-connector" [class.completed]="currentStep > 1"></div>
            <div class="step-indicator" [class.active]="currentStep === 2" [class.completed]="currentStep > 2">
              <div class="step-number">
                <span *ngIf="currentStep > 2">✓</span>
                <span *ngIf="currentStep <= 2">2</span>
              </div>
              <span class="step-label">Address</span>
            </div>
            <div class="step-connector" [class.completed]="currentStep > 2"></div>
            <div class="step-indicator" [class.active]="currentStep === 3" [class.completed]="currentStep > 3">
              <div class="step-number">
                <span *ngIf="currentStep > 3">✓</span>
                <span *ngIf="currentStep <= 3">3</span>
              </div>
              <span class="step-label">Contact</span>
            </div>
          </div>

          <form [formGroup]="entityForm" (ngSubmit)="onSubmit()" class="entity-form">
            
            <!-- Step 1: Basic Information -->
            <div *ngIf="currentStep === 1" class="step-content">
              <div class="form-section">
                <h3 class="section-title">
                  <span class="section-icon">🏢</span>
                  Basic Information
                </h3>
                
                <div class="form-group">
                  <label for="entity-name" class="form-label">Entity Name *</label>
                  <input 
                    id="entity-name"
                    type="text" 
                    formControlName="name" 
                    class="pure-input"
                    placeholder="Enter legal entity name"
                    autocomplete="off">
                  <div *ngIf="entityForm.get('name')?.invalid && entityForm.get('name')?.touched" class="error-message">
                    <span *ngIf="entityForm.get('name')?.hasError('required')">Entity name is required</span>
                    <span *ngIf="entityForm.get('name')?.hasError('minlength')">Name must be at least 2 characters long</span>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="entity-type" class="form-label">Entity Type *</label>
                    <div class="pure-select-wrapper">
                      <select 
                        id="entity-type"
                        formControlName="type" 
                        class="pure-select">
                        <option value="">Select entity type</option>
                        <option *ngFor="let type of entityTypes" [value]="type.value">
                          {{ type.label }}
                        </option>
                      </select>
                      <span class="select-arrow">▼</span>
                    </div>
                    <div *ngIf="entityForm.get('type')?.invalid && entityForm.get('type')?.touched" class="error-message">
                      Entity type is required
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="registration-number" class="form-label">Registration Number *</label>
                    <input 
                      id="registration-number"
                      type="text" 
                      formControlName="registrationNumber" 
                      class="pure-input"
                      placeholder="Enter registration number"
                      autocomplete="off">
                    <div *ngIf="entityForm.get('registrationNumber')?.invalid && entityForm.get('registrationNumber')?.touched" class="error-message">
                      Registration number is required
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="employee-count" class="form-label">Employee Count *</label>
                    <input 
                      id="employee-count"
                      type="number" 
                      formControlName="employeeCount" 
                      class="pure-input"
                      placeholder="Number of employees"
                      min="0"
                      autocomplete="off">
                    <div *ngIf="entityForm.get('employeeCount')?.invalid && entityForm.get('employeeCount')?.touched" class="error-message">
                      <span *ngIf="entityForm.get('employeeCount')?.hasError('required')">Employee count is required</span>
                      <span *ngIf="entityForm.get('employeeCount')?.hasError('min')">Employee count must be 0 or greater</span>
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="entity-status" class="form-label">Status</label>
                    <div class="pure-select-wrapper">
                      <select 
                        id="entity-status"
                        formControlName="status" 
                        class="pure-select">
                        <option *ngFor="let status of entityStatuses" [value]="status.value">
                          {{ status.label }}
                        </option>
                      </select>
                      <span class="select-arrow">▼</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="step-actions">
                <div></div>
                <button 
                  type="button"
                  (click)="nextStep()"
                  [disabled]="!isStep1Valid()"
                  class="btn btn-primary next-button">
                  <span class="btn-icon">→</span>
                  Next: Address
                </button>
              </div>
            </div>

            <!-- Step 2: Address Information -->
            <div *ngIf="currentStep === 2" class="step-content">
              <div class="form-section">
                <h3 class="section-title">
                  <span class="section-icon">📍</span>
                  Address Information
                </h3>
                
                <div class="form-group">
                  <label for="street-address" class="form-label">Street Address *</label>
                  <input 
                    id="street-address"
                    type="text" 
                    formControlName="street" 
                    class="pure-input"
                    placeholder="Enter street address"
                    autocomplete="off">
                  <div *ngIf="entityForm.get('street')?.invalid && entityForm.get('street')?.touched" class="error-message">
                    Street address is required
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="city" class="form-label">City *</label>
                    <input 
                      id="city"
                      type="text" 
                      formControlName="city" 
                      class="pure-input"
                      placeholder="Enter city"
                      autocomplete="off">
                    <div *ngIf="entityForm.get('city')?.invalid && entityForm.get('city')?.touched" class="error-message">
                      City is required
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="postal-code" class="form-label">Postal Code *</label>
                    <input 
                      id="postal-code"
                      type="text" 
                      formControlName="postalCode" 
                      class="pure-input"
                      placeholder="Enter postal code"
                      autocomplete="off">
                    <div *ngIf="entityForm.get('postalCode')?.invalid && entityForm.get('postalCode')?.touched" class="error-message">
                      Postal code is required
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="country" class="form-label">Country *</label>
                  <input 
                    id="country"
                    type="text" 
                    formControlName="country" 
                    class="pure-input"
                    placeholder="Enter country"
                    autocomplete="off">
                  <div *ngIf="entityForm.get('country')?.invalid && entityForm.get('country')?.touched" class="error-message">
                    Country is required
                  </div>
                </div>
              </div>

              <div class="step-actions">
                <button 
                  type="button"
                  (click)="previousStep()"
                  class="btn btn-secondary back-button">
                  <span class="btn-icon">←</span>
                  Back
                </button>
                <button 
                  type="button"
                  (click)="nextStep()"
                  [disabled]="!isStep2Valid()"
                  class="btn btn-primary next-button">
                  <span class="btn-icon">→</span>
                  Next: Contact
                </button>
              </div>
            </div>

            <!-- Step 3: Contact Information -->
            <div *ngIf="currentStep === 3" class="step-content">
              <div class="form-section">
                <h3 class="section-title">
                  <span class="section-icon">👤</span>
                  Contact Person
                </h3>
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="contact-name" class="form-label">Full Name *</label>
                    <input 
                      id="contact-name"
                      type="text" 
                      formControlName="contactName" 
                      class="pure-input"
                      placeholder="Enter contact person name"
                      autocomplete="off">
                    <div *ngIf="entityForm.get('contactName')?.invalid && entityForm.get('contactName')?.touched" class="error-message">
                      Contact name is required
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="contact-position" class="form-label">Position *</label>
                    <input 
                      id="contact-position"
                      type="text" 
                      formControlName="contactPosition" 
                      class="pure-input"
                      placeholder="Enter position/title"
                      autocomplete="off">
                    <div *ngIf="entityForm.get('contactPosition')?.invalid && entityForm.get('contactPosition')?.touched" class="error-message">
                      Position is required
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="contact-email" class="form-label">Email Address *</label>
                  <input 
                    id="contact-email"
                    type="email" 
                    formControlName="contactEmail" 
                    class="pure-input"
                    placeholder="Enter email address"
                    autocomplete="off">
                  <div *ngIf="entityForm.get('contactEmail')?.invalid && entityForm.get('contactEmail')?.touched" class="error-message">
                    <span *ngIf="entityForm.get('contactEmail')?.hasError('required')">Email is required</span>
                    <span *ngIf="entityForm.get('contactEmail')?.hasError('email')">Please enter a valid email address</span>
                  </div>
                </div>

                <div class="form-group">
                  <label for="contact-phone" class="form-label">Phone Number *</label>
                  <input 
                    id="contact-phone"
                    type="tel" 
                    formControlName="contactPhone" 
                    class="pure-input"
                    placeholder="Enter phone number"
                    autocomplete="off">
                  <div *ngIf="entityForm.get('contactPhone')?.invalid && entityForm.get('contactPhone')?.touched" class="error-message">
                    Phone number is required
                  </div>
                </div>
              </div>

              <div class="step-actions">
                <button 
                  type="button"
                  (click)="previousStep()"
                  class="btn btn-secondary back-button">
                  <span class="btn-icon">←</span>
                  Back
                </button>
                <button 
                  type="submit"
                  [disabled]="entityForm.invalid || isSubmitting"
                  class="btn btn-primary submit-button"
                  (click)="$event.preventDefault(); onSubmit()">
                  <span *ngIf="!isSubmitting" class="btn-icon">💾</span>
                  <span *ngIf="isSubmitting" class="spinner"></span>
                  {{ isSubmitting ? 'Updating...' : 'Update Legal Entity' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Reset all Material styles */
    * {
      box-sizing: border-box;
    }

    /* Override any global Material styles */
    .modal-overlay,
    .modal-overlay * {
      font-family: 'Roboto', sans-serif !important;
    }

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
      z-index: 10000;
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
      position: relative;
      z-index: 10001;
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
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .close-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .icon {
      font-size: 1.5rem;
      margin-right: 8px;
    }

    .modal-content {
      max-height: calc(90vh - 80px);
      overflow-y: auto;
      padding: 0;
    }

    /* Custom Stepper Styles */
    .stepper-header {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 24px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .step-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      opacity: 0.5;
      transition: all 0.3s ease;
    }

    .step-indicator.active {
      opacity: 1;
      color: #9E7FFF;
    }

    .step-indicator.completed {
      opacity: 1;
      color: #10b981;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e2e8f0;
      color: #64748b;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .step-indicator.active .step-number {
      background: #9E7FFF;
      color: white;
    }

    .step-indicator.completed .step-number {
      background: #10b981;
      color: white;
    }

    .step-label {
      font-size: 0.875rem;
      font-weight: 500;
      text-align: center;
    }

    .step-connector {
      width: 80px;
      height: 2px;
      background: #e2e8f0;
      margin: 0 16px;
      transition: all 0.3s ease;
    }

    .step-connector.completed {
      background: #10b981;
    }

    /* Form Styles */
    .entity-form {
      padding: 32px;
      position: relative;
      z-index: 1;
    }

    .step-content {
      position: relative;
      z-index: 1;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: #1f2937;
      padding-bottom: 12px;
      border-bottom: 2px solid #e5e7eb;
    }

    .section-icon {
      font-size: 1.25rem;
    }

    .form-group {
      margin-bottom: 20px;
      position: relative;
      z-index: 2;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-label {
      display: block;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
      font-size: 14px;
      cursor: pointer;
    }

    /* Pure HTML Input Styles - NO MATERIAL */
    .pure-input {
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
      outline: none;
      position: relative;
      z-index: 10;
    }

    .pure-input:focus {
      border-color: #9E7FFF;
      box-shadow: 0 0 0 3px rgba(158, 127, 255, 0.1);
    }

    .pure-input:hover {
      border-color: #9ca3af;
    }

    .pure-input::placeholder {
      color: #9ca3af;
    }

    /* Pure HTML Select Styles - NO MATERIAL */
    .pure-select-wrapper {
      position: relative;
      z-index: 10;
    }

    .pure-select {
      width: 100%;
      padding: 12px 40px 12px 16px;
      border: 2px solid #d1d5db;
      border-radius: 8px;
      font-size: 16px;
      font-family: 'Roboto', sans-serif;
      background-color: white;
      color: #1f2937;
      transition: all 0.2s ease;
      box-sizing: border-box;
      outline: none;
      cursor: pointer;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      position: relative;
      z-index: 10;
    }

    .pure-select:focus {
      border-color: #9E7FFF;
      box-shadow: 0 0 0 3px rgba(158, 127, 255, 0.1);
    }

    .pure-select:hover {
      border-color: #9ca3af;
    }

    .select-arrow {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
      pointer-events: none;
      font-size: 12px;
      z-index: 11;
    }

    .error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
      font-weight: 500;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      margin-top: 32px;
      gap: 16px;
    }

    /* Button Styles */
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      outline: none;
      position: relative;
      z-index: 10;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(56, 189, 248, 0.3);
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #6b7280;
      border: 1px solid #d1d5db;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-icon {
      font-size: 16px;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Ensure no Material interference */
    .modal-overlay .cdk-overlay-container,
    .modal-overlay .mat-select-panel,
    .modal-overlay .mat-option,
    .modal-overlay .mat-form-field,
    .modal-overlay [class*="mat-"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      z-index: -1000 !important;
    }

    @media (max-width: 768px) {
      .modal-container {
        width: 95vw;
        max-height: 95vh;
      }

      .stepper-header {
        padding: 24px 16px;
      }

      .step-connector {
        width: 40px;
        margin: 0 8px;
      }

      .step-label {
        font-size: 0.75rem;
      }

      .entity-form {
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
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .modal-container {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
      }

      .entity-form {
        padding: 16px;
      }

      .stepper-header {
        padding: 16px;
      }

      .step-number {
        width: 32px;
        height: 32px;
        font-size: 0.875rem;
      }

      .step-connector {
        width: 30px;
      }
    }
  `]
})
export class EditLegalEntityModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Input() entity: LegalEntity | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() entityUpdated = new EventEmitter<LegalEntity>();

  entityForm!: FormGroup;
  isSubmitting = false;
  currentStep = 1;

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
    this.initializeForm();
  }

  ngOnInit(): void {
    document.addEventListener('keydown', this.handleEscapeKey.bind(this));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue && this.entity) {
      this.populateForm();
      this.currentStep = 1;
    }
  }

  private initializeForm(): void {
    this.entityForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      employeeCount: ['', [Validators.required, Validators.min(0)]],
      status: [EntityStatus.ACTIVE, Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      country: ['', Validators.required],
      contactName: ['', Validators.required],
      contactPosition: ['', Validators.required],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['', Validators.required]
    });
  }

  private populateForm(): void {
    if (!this.entity) return;

    this.entityForm.patchValue({
      name: this.entity.name,
      type: this.entity.type,
      registrationNumber: this.entity.registrationNumber,
      employeeCount: this.entity.employeeCount,
      status: this.entity.status,
      street: this.entity.address.street,
      city: this.entity.address.city,
      postalCode: this.entity.address.postalCode,
      country: this.entity.address.country,
      contactName: this.entity.contactPerson.name,
      contactPosition: this.entity.contactPerson.position,
      contactEmail: this.entity.contactPerson.email,
      contactPhone: this.entity.contactPerson.phone
    });
  }

  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStep1Valid(): boolean {
    const step1Fields = ['name', 'type', 'registrationNumber', 'employeeCount'];
    return step1Fields.every(field => {
      const control = this.entityForm.get(field);
      return control && control.valid;
    });
  }

  isStep2Valid(): boolean {
    const step2Fields = ['street', 'city', 'postalCode', 'country'];
    return step2Fields.every(field => {
      const control = this.entityForm.get(field);
      return control && control.valid;
    });
  }

  onSubmit(): void {
    if (this.entityForm.invalid || this.isSubmitting || !this.entity) {
      return;
    }

    // Prevent multiple submissions
    if (this.isSubmitting) {
      Object.keys(this.entityForm.controls).forEach(key => {
        this.entityForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.entityForm.value;

    const updatedEntity: Partial<LegalEntity> = {
      name: formValue.name,
      type: formValue.type,
      registrationNumber: formValue.registrationNumber,
      employeeCount: formValue.employeeCount,
      status: formValue.status,
      address: {
        street: formValue.street,
        city: formValue.city,
        postalCode: formValue.postalCode,
        country: formValue.country
      },
      contactPerson: {
        name: formValue.contactName,
        position: formValue.contactPosition,
        email: formValue.contactEmail,
        phone: formValue.contactPhone
      }
    };

    this.companyService.updateLegalEntity(this.entity.id, updatedEntity)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting = false)
      )
      .subscribe({
        next: (entity) => {
          this.entityUpdated.emit(entity);
        },
        error: (error) => {
          console.error('Error updating legal entity:', error);
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