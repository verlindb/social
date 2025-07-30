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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { CompanyService } from '../../services/company.service';
import { LegalEntity, LegalEntityType, EntityStatus } from '../../models/legal-entity.model';

interface EditableField {
  key: string;
  label: string;
  value: any;
  type: 'text' | 'select' | 'number' | 'email' | 'tel';
  options?: { value: any; label: string }[];
  isEditing: boolean;
  validators?: any[];
}

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
    MatStepperModule,
    MatTooltipModule,
    MatCardModule,
    MatChipsModule
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
          <!-- Basic Information Section -->
          <mat-card class="section-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>business</mat-icon>
                Basic Information
              </mat-card-title>
              <mat-card-subtitle>Click on any field to edit</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div class="inline-editor-grid">
                <div 
                  *ngFor="let field of basicInfoFields" 
                  class="inline-editor-item"
                  [class.editing]="field.isEditing">
                  
                  <div class="field-label">{{ field.label }}</div>
                  
                  <!-- Display Mode -->
                  <div 
                    *ngIf="!field.isEditing" 
                    class="field-display"
                    (click)="startEditing(field)"
                    matTooltip="Click to edit"
                    [attr.aria-label]="'Edit ' + field.label">
                    
                    <span class="field-value" [class.empty]="!field.value">
                      {{ getDisplayValue(field) }}
                    </span>
                    <mat-icon class="edit-icon">edit</mat-icon>
                  </div>
                  
                  <!-- Edit Mode -->
                  <div *ngIf="field.isEditing" class="field-editor">
                    <!-- Text/Number/Email/Tel Input -->
                    <mat-form-field 
                      *ngIf="field.type !== 'select'" 
                      appearance="outline" 
                      class="inline-input">
                      <input 
                        matInput 
                        [type]="field.type"
                        [(ngModel)]="field.value"
                        [placeholder]="'Enter ' + field.label.toLowerCase()"
                        (keyup.enter)="saveField(field)"
                        (keyup.escape)="cancelEdit(field)"
                        #inputRef>
                    </mat-form-field>
                    
                    <!-- Select Input -->
                    <mat-form-field 
                      *ngIf="field.type === 'select'" 
                      appearance="outline" 
                      class="inline-input">
                      <mat-select 
                        [(ngModel)]="field.value"
                        [placeholder]="'Select ' + field.label.toLowerCase()">
                        <mat-option 
                          *ngFor="let option of field.options" 
                          [value]="option.value">
                          {{ option.label }}
                        </mat-option>
                      </mat-select>
                    </mat-form-field>
                    
                    <div class="field-actions">
                      <button 
                        mat-icon-button 
                        color="primary"
                        (click)="saveField(field)"
                        matTooltip="Save"
                        class="save-btn">
                        <mat-icon>check</mat-icon>
                      </button>
                      <button 
                        mat-icon-button 
                        (click)="cancelEdit(field)"
                        matTooltip="Cancel"
                        class="cancel-btn">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Address Information Section -->
          <mat-card class="section-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>location_on</mat-icon>
                Address Information
              </mat-card-title>
              <mat-card-subtitle>Click on any field to edit</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div class="inline-editor-grid">
                <div 
                  *ngFor="let field of addressFields" 
                  class="inline-editor-item"
                  [class.editing]="field.isEditing">
                  
                  <div class="field-label">{{ field.label }}</div>
                  
                  <!-- Display Mode -->
                  <div 
                    *ngIf="!field.isEditing" 
                    class="field-display"
                    (click)="startEditing(field)"
                    matTooltip="Click to edit"
                    [attr.aria-label]="'Edit ' + field.label">
                    
                    <span class="field-value" [class.empty]="!field.value">
                      {{ field.value || 'Click to add ' + field.label.toLowerCase() }}
                    </span>
                    <mat-icon class="edit-icon">edit</mat-icon>
                  </div>
                  
                  <!-- Edit Mode -->
                  <div *ngIf="field.isEditing" class="field-editor">
                    <mat-form-field appearance="outline" class="inline-input">
                      <input 
                        matInput 
                        [(ngModel)]="field.value"
                        [placeholder]="'Enter ' + field.label.toLowerCase()"
                        (keyup.enter)="saveField(field)"
                        (keyup.escape)="cancelEdit(field)">
                    </mat-form-field>
                    
                    <div class="field-actions">
                      <button 
                        mat-icon-button 
                        color="primary"
                        (click)="saveField(field)"
                        matTooltip="Save"
                        class="save-btn">
                        <mat-icon>check</mat-icon>
                      </button>
                      <button 
                        mat-icon-button 
                        (click)="cancelEdit(field)"
                        matTooltip="Cancel"
                        class="cancel-btn">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Contact Information Section -->
          <mat-card class="section-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>person</mat-icon>
                Contact Person
              </mat-card-title>
              <mat-card-subtitle>Click on any field to edit</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content>
              <div class="inline-editor-grid">
                <div 
                  *ngFor="let field of contactFields" 
                  class="inline-editor-item"
                  [class.editing]="field.isEditing">
                  
                  <div class="field-label">{{ field.label }}</div>
                  
                  <!-- Display Mode -->
                  <div 
                    *ngIf="!field.isEditing" 
                    class="field-display"
                    (click)="startEditing(field)"
                    matTooltip="Click to edit"
                    [attr.aria-label]="'Edit ' + field.label">
                    
                    <span class="field-value" [class.empty]="!field.value">
                      {{ field.value || 'Click to add ' + field.label.toLowerCase() }}
                    </span>
                    <mat-icon class="edit-icon">edit</mat-icon>
                  </div>
                  
                  <!-- Edit Mode -->
                  <div *ngIf="field.isEditing" class="field-editor">
                    <mat-form-field appearance="outline" class="inline-input">
                      <input 
                        matInput 
                        [type]="field.type"
                        [(ngModel)]="field.value"
                        [placeholder]="'Enter ' + field.label.toLowerCase()"
                        (keyup.enter)="saveField(field)"
                        (keyup.escape)="cancelEdit(field)">
                    </mat-form-field>
                    
                    <div class="field-actions">
                      <button 
                        mat-icon-button 
                        color="primary"
                        (click)="saveField(field)"
                        matTooltip="Save"
                        class="save-btn">
                        <mat-icon>check</mat-icon>
                      </button>
                      <button 
                        mat-icon-button 
                        (click)="cancelEdit(field)"
                        matTooltip="Cancel"
                        class="cancel-btn">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Form Actions -->
          <div class="form-actions">
            <button 
              mat-button 
              (click)="onClose()"
              class="cancel-button">
              Cancel
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
      max-width: 900px;
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

    .modal-content {
      padding: 24px;
      max-height: calc(90vh - 140px);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .section-card {
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .section-card mat-card-header {
      padding-bottom: 16px;
    }

    .section-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #171717;
      font-size: 1.25rem;
    }

    .section-card mat-card-subtitle {
      color: #6b7280;
      font-size: 0.875rem;
      margin-top: 4px;
    }

    .inline-editor-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .inline-editor-item {
      border: 2px solid transparent;
      border-radius: 8px;
      padding: 12px;
      transition: all 0.2s ease;
      background: #f9fafb;
    }

    .inline-editor-item:hover {
      background: #f3f4f6;
      border-color: #e5e7eb;
    }

    .inline-editor-item.editing {
      background: white;
      border-color: #9E7FFF;
      box-shadow: 0 0 0 3px rgba(158, 127, 255, 0.1);
    }

    .field-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
    }

    .field-display {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 6px;
      transition: all 0.2s ease;
      min-height: 40px;
    }

    .field-display:hover {
      background: rgba(158, 127, 255, 0.1);
    }

    .field-value {
      flex: 1;
      font-size: 1rem;
      color: #171717;
    }

    .field-value.empty {
      color: #9ca3af;
      font-style: italic;
    }

    .edit-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #6b7280;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .field-display:hover .edit-icon {
      opacity: 1;
    }

    .field-editor {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .inline-input {
      flex: 1;
      margin-bottom: 0 !important;
    }

    .field-actions {
      display: flex;
      gap: 4px;
    }

    .save-btn {
      color: #10b981;
    }

    .cancel-btn {
      color: #6b7280;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .submit-button {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    /* Material Form Field Overrides */
    ::ng-deep .inline-input .mat-mdc-form-field-wrapper {
      padding-bottom: 0;
    }

    ::ng-deep .inline-input .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    ::ng-deep .inline-input .mdc-text-field {
      height: 40px;
    }

    ::ng-deep .inline-input .mat-mdc-input-element {
      padding: 8px 12px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .modal-container {
        width: 95vw;
        max-height: 95vh;
      }

      .inline-editor-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .modal-content {
        padding: 16px;
      }
    }

    @media (max-width: 480px) {
      .modal-container {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        border-radius: 0;
      }

      .field-editor {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .field-actions {
        justify-content: center;
      }
    }
  `]
})
export class AddLegalEntityModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() entityAdded = new EventEmitter<LegalEntity>();

  isSubmitting = false;

  basicInfoFields: EditableField[] = [
    {
      key: 'name',
      label: 'Entity Name',
      value: '',
      type: 'text',
      isEditing: false,
      validators: [Validators.required, Validators.minLength(2)]
    },
    {
      key: 'type',
      label: 'Entity Type',
      value: '',
      type: 'select',
      isEditing: false,
      options: [
        { value: LegalEntityType.CORPORATION, label: 'Corporation' },
        { value: LegalEntityType.LLC, label: 'Limited Liability Company' },
        { value: LegalEntityType.PARTNERSHIP, label: 'Partnership' },
        { value: LegalEntityType.SUBSIDIARY, label: 'Subsidiary' },
        { value: LegalEntityType.BRANCH, label: 'Branch Office' },
        { value: LegalEntityType.DIVISION, label: 'Division' }
      ],
      validators: [Validators.required]
    },
    {
      key: 'registrationNumber',
      label: 'Registration Number',
      value: '',
      type: 'text',
      isEditing: false,
      validators: [Validators.required]
    },
    {
      key: 'employeeCount',
      label: 'Employee Count',
      value: 0,
      type: 'number',
      isEditing: false,
      validators: [Validators.required, Validators.min(0)]
    },
    {
      key: 'status',
      label: 'Status',
      value: EntityStatus.ACTIVE,
      type: 'select',
      isEditing: false,
      options: [
        { value: EntityStatus.ACTIVE, label: 'Active' },
        { value: EntityStatus.INACTIVE, label: 'Inactive' },
        { value: EntityStatus.PENDING, label: 'Pending' },
        { value: EntityStatus.SUSPENDED, label: 'Suspended' }
      ],
      validators: [Validators.required]
    }
  ];

  addressFields: EditableField[] = [
    {
      key: 'street',
      label: 'Street Address',
      value: '',
      type: 'text',
      isEditing: false,
      validators: [Validators.required]
    },
    {
      key: 'city',
      label: 'City',
      value: '',
      type: 'text',
      isEditing: false,
      validators: [Validators.required]
    },
    {
      key: 'postalCode',
      label: 'Postal Code',
      value: '',
      type: 'text',
      isEditing: false,
      validators: [Validators.required]
    },
    {
      key: 'country',
      label: 'Country',
      value: '',
      type: 'text',
      isEditing: false,
      validators: [Validators.required]
    }
  ];

  contactFields: EditableField[] = [
    {
      key: 'name',
      label: 'Full Name',
      value: '',
      type: 'text',
      isEditing: false,
      validators: [Validators.required]
    },
    {
      key: 'position',
      label: 'Position',
      value: '',
      type: 'text',
      isEditing: false,
      validators: [Validators.required]
    },
    {
      key: 'email',
      label: 'Email Address',
      value: '',
      type: 'email',
      isEditing: false,
      validators: [Validators.required, Validators.email]
    },
    {
      key: 'phone',
      label: 'Phone Number',
      value: '',
      type: 'tel',
      isEditing: false,
      validators: [Validators.required]
    }
  ];

  private destroy$ = new Subject<void>();
  private originalValues = new Map<string, any>();

  constructor(
    private companyService: CompanyService
  ) {}

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
      this.resetFields();
    }
  }

  private resetFields(): void {
    // Reset basic info fields
    this.basicInfoFields.forEach(field => {
      field.value = field.key === 'status' ? EntityStatus.ACTIVE : 
                   field.key === 'employeeCount' ? 0 : '';
      field.isEditing = false;
    });

    // Reset address fields
    this.addressFields.forEach(field => {
      field.value = '';
      field.isEditing = false;
    });

    // Reset contact fields
    this.contactFields.forEach(field => {
      field.value = '';
      field.isEditing = false;
    });

    this.isSubmitting = false;
    this.originalValues.clear();
  }

  startEditing(field: EditableField): void {
    // Save original value for cancel functionality
    this.originalValues.set(field.key, field.value);
    field.isEditing = true;
    
    // Focus the input after a short delay
    setTimeout(() => {
      const input = document.querySelector('.inline-input input, .inline-input mat-select') as HTMLElement;
      if (input) {
        input.focus();
      }
    }, 100);
  }

  saveField(field: EditableField): void {
    field.isEditing = false;
    this.originalValues.delete(field.key);
  }

  cancelEdit(field: EditableField): void {
    const originalValue = this.originalValues.get(field.key);
    if (originalValue !== undefined) {
      field.value = originalValue;
    }
    field.isEditing = false;
    this.originalValues.delete(field.key);
  }

  getDisplayValue(field: EditableField): string {
    if (field.type === 'select' && field.options) {
      const option = field.options.find(opt => opt.value === field.value);
      return option ? option.label : field.value;
    }
    return field.value || `Click to add ${field.label.toLowerCase()}`;
  }

  isFormValid(): boolean {
    const allFields = [...this.basicInfoFields, ...this.addressFields, ...this.contactFields];
    return allFields.every(field => {
      if (field.validators?.includes(Validators.required)) {
        return field.value && field.value.toString().trim() !== '';
      }
      return true;
    });
  }

  onSubmit(): void {
    if (!this.isFormValid() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    // Build entity object from fields
    const basicInfo = this.basicInfoFields.reduce((obj, field) => {
      obj[field.key] = field.value;
      return obj;
    }, {} as any);

    const address = this.addressFields.reduce((obj, field) => {
      obj[field.key] = field.value;
      return obj;
    }, {} as any);

    const contact = this.contactFields.reduce((obj, field) => {
      obj[field.key] = field.value;
      return obj;
    }, {} as any);

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