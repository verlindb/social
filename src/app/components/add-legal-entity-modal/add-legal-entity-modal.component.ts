import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatProgressSpinnerModule
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
            aria-label="Close modal">
            <mat-icon>close</mat-icon>
          </button>
        </header>

        <div class="modal-content">
          <form [formGroup]="entityForm" (ngSubmit)="onSubmit()" class="entity-form">
            
            <!-- Basic Information Section -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>business</mat-icon>
                Basic Information
              </h3>
              
              <div class="form-group">
                <label for="entity-name" class="form-label">Entity Name *</label>
                <input 
                  id="entity-name"
                  type="text" 
                  formControlName="name" 
                  class="form-input"
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
                  <select 
                    id="entity-type"
                    formControlName="type" 
                    class="form-select">
                    <option value="">Select entity type</option>
                    <option *ngFor="let type of entityTypes" [value]="type.value">
                      {{ type.label }}
                    </option>
                  </select>
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
                    class="form-input"
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
                    class="form-input"
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
                  <select 
                    id="entity-status"
                    formControlName="status" 
                    class="form-select">
                    <option *ngFor="let status of entityStatuses" [value]="status.value">
                      {{ status.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Address Section -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>location_on</mat-icon>
                Address Information
              </h3>
              
              <div class="form-group">
                <label for="street-address" class="form-label">Street Address *</label>
                <input 
                  id="street-address"
                  type="text" 
                  formControlName="street" 
                  class="form-input"
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
                    class="form-input"
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
                    class="form-input"
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
                  class="form-input"
                  placeholder="Enter country"
                  autocomplete="off">
                <div *ngIf="entityForm.get('country')?.invalid && entityForm.get('country')?.touched" class="error-message">
                  Country is required
                </div>
              </div>
            </div>

            <!-- Contact Information Section -->
            <div class="form-section">
              <h3 class="section-title">
                <mat-icon>person</mat-icon>
                Contact Person
              </h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="contact-name" class="form-label">Full Name *</label>
                  <input 
                    id="contact-name"
                    type="text" 
                    formControlName="contactName" 
                    class="form-input"
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
                    class="form-input"
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
                  class="form-input"
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
                  class="form-input"
                  placeholder="Enter phone number"
                  autocomplete="off">
                <div *ngIf="entityForm.get('contactPhone')?.invalid && entityForm.get('contactPhone')?.touched" class="error-message">
                  Phone number is required
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
              <button 
                type="button"
                mat-button 
                (click)="onClose()"
                [disabled]="isSubmitting"
                class="cancel-button">
                Cancel
              </button>
              <button 
                type="submit"
                mat-raised-button 
                color="primary"
                [disabled]="entityForm.invalid || isSubmitting"
                class="submit-button">
                <mat-icon *ngIf="!isSubmitting" aria-hidden="true">save</mat-icon>
                <mat-spinner *ngIf="isSubmitting" diameter="20" aria-hidden="true"></mat-spinner>
                {{ isSubmitting ? 'Adding...' : 'Add Legal Entity' }}
              </button>
            </div>
          </form>
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

    .modal-content {
      max-height: calc(90vh - 80px);
      overflow-y: auto;
      padding: 0;
    }

    .entity-form {
      padding: 32px;
    }

    .form-section {
      margin-bottom: 40px;
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

    .form-group {
      margin-bottom: 20px;
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
    }

    .form-input,
    .form-select {
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
    }

    .form-input:focus,
    .form-select:focus {
      outline: none;
      border-color: #9E7FFF;
      box-shadow: 0 0 0 3px rgba(158, 127, 255, 0.1);
    }

    .form-input:hover,
    .form-select:hover {
      border-color: #9ca3af;
    }

    .form-input::placeholder {
      color: #9ca3af;
    }

    .form-select {
      cursor: pointer;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 12px center;
      background-repeat: no-repeat;
      background-size: 16px;
      padding-right: 40px;
    }

    .error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      margin-top: 32px;
    }

    .cancel-button {
      color: #6b7280;
      font-weight: 500;
    }

    .submit-button {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .modal-container {
        width: 95vw;
        max-height: 95vh;
      }

      .entity-form {
        padding: 24px 16px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .form-actions {
        flex-direction: column;
        gap: 12px;
      }

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
    }
  `]
})
export class AddLegalEntityModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() entityAdded = new EventEmitter<LegalEntity>();

  entityForm!: FormGroup;
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
    if (changes['isOpen'] && changes['isOpen'].currentValue) {
      this.resetForm();
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

  private resetForm(): void {
    this.entityForm.reset({
      status: EntityStatus.ACTIVE
    });
    this.isSubmitting = false;
  }

  onSubmit(): void {
    if (this.entityForm.invalid || this.isSubmitting) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.entityForm.controls).forEach(key => {
        this.entityForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formValue = this.entityForm.value;

    const newEntity: Omit<LegalEntity, 'id' | 'createdAt' | 'updatedAt'> = {
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