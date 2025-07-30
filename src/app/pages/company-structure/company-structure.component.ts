import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { CompanyService } from '../../services/company.service';
import { LegalEntity, CompanyInfo } from '../../models/legal-entity.model';
import { AddLegalEntityModalComponent } from '../../components/add-legal-entity-modal/add-legal-entity-modal.component';
import { EditLegalEntityModalComponent } from '../../components/edit-legal-entity-modal/edit-legal-entity-modal.component';
import { DeleteConfirmationDialogComponent } from '../../components/delete-confirmation-dialog/delete-confirmation-dialog.component';

@Component({
  selector: 'app-company-structure',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatTooltipModule,
    MatDividerModule,
    MatDialogModule,
    AddLegalEntityModalComponent,
    EditLegalEntityModalComponent,
    DeleteConfirmationDialogComponent
  ],
  template: `
    <div class="company-structure-container">
      <header class="page-header">
        <div class="header-content">
          <h1 class="page-title">Company Structure</h1>
          <p class="page-description">
            Manage your company information and legal entity structure for social elections
          </p>
        </div>
      </header>

      <div class="content-wrapper">
        <!-- Company Information Section -->
        <section class="company-info-section" aria-labelledby="company-info-title">
          <mat-card class="company-info-card fade-in-up">
            <mat-card-header>
              <mat-card-title id="company-info-title">
                <mat-icon aria-hidden="true">business</mat-icon>
                Company Information
              </mat-card-title>
              <mat-card-subtitle>
                Update your company details and headquarters information
              </mat-card-subtitle>
            </mat-card-header>

            <mat-card-content>
              <div *ngIf="isLoadingCompanyInfo" class="loading-spinner">
                <mat-spinner diameter="40" aria-label="Loading company information"></mat-spinner>
                <p class="sr-only">Loading company information</p>
              </div>

              <form 
                *ngIf="!isLoadingCompanyInfo && companyForm" 
                [formGroup]="companyForm" 
                (ngSubmit)="onSaveCompanyInfo()"
                class="company-form">
                
                <div class="form-row">
                  <div class="form-group">
                    <label for="company-name" class="form-label">Company Name *</label>
                    <input 
                      id="company-name"
                      type="text"
                      formControlName="name" 
                      class="pure-input"
                      placeholder="Enter company name"
                      autocomplete="off">
                    <div class="form-hint">Legal name of your company</div>
                    <div *ngIf="companyForm.get('name')?.hasError('required') && companyForm.get('name')?.touched" class="error-message">
                      Company name is required
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="industry" class="form-label">Industry *</label>
                    <div class="pure-select-wrapper">
                      <select 
                        id="industry"
                        formControlName="industry" 
                        class="pure-select"
                        aria-label="Select industry">
                        <option value="">Select industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                      </select>
                      <span class="select-arrow">▼</span>
                    </div>
                    <div *ngIf="companyForm.get('industry')?.hasError('required') && companyForm.get('industry')?.touched" class="error-message">
                      Industry is required
                    </div>
                  </div>
                </div>

                <div class="form-group full-width">
                  <label for="description" class="form-label">Description</label>
                  <textarea 
                    id="description"
                    formControlName="description" 
                    class="pure-textarea"
                    rows="3"
                    placeholder="Brief description of your company"
                    autocomplete="off"></textarea>
                  <div class="form-hint">Describe your company's main activities</div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="founded-year" class="form-label">Founded Year</label>
                    <input 
                      id="founded-year"
                      type="number" 
                      formControlName="foundedYear"
                      class="pure-input"
                      min="1800"
                      [max]="currentYear"
                      placeholder="YYYY"
                      autocomplete="off">
                  </div>

                  <div class="form-group">
                    <label for="website" class="form-label">Website</label>
                    <input 
                      id="website"
                      type="url"
                      formControlName="website" 
                      class="pure-input"
                      placeholder="https://example.com"
                      autocomplete="off">
                  </div>
                </div>

                <div class="address-section">
                  <h3 class="section-title">Headquarters Address</h3>
                  
                  <div class="form-group full-width">
                    <label for="street" class="form-label">Street Address</label>
                    <input 
                      id="street"
                      type="text"
                      formControlName="street" 
                      class="pure-input"
                      placeholder="Enter street address"
                      autocomplete="off">
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="city" class="form-label">City</label>
                      <input 
                        id="city"
                        type="text"
                        formControlName="city" 
                        class="pure-input"
                        placeholder="Enter city"
                        autocomplete="off">
                    </div>

                    <div class="form-group">
                      <label for="postal-code" class="form-label">Postal Code</label>
                      <input 
                        id="postal-code"
                        type="text"
                        formControlName="postalCode" 
                        class="pure-input"
                        placeholder="Enter postal code"
                        autocomplete="off">
                    </div>

                    <div class="form-group">
                      <label for="country" class="form-label">Country</label>
                      <input 
                        id="country"
                        type="text"
                        formControlName="country" 
                        class="pure-input"
                        placeholder="Enter country"
                        autocomplete="off">
                    </div>
                  </div>
                </div>

                <div class="form-actions">
                  <button 
                    mat-raised-button 
                    color="primary" 
                    type="submit"
                    [disabled]="companyForm.invalid || isSavingCompanyInfo"
                    class="save-button">
                    <mat-icon *ngIf="!isSavingCompanyInfo" aria-hidden="true">save</mat-icon>
                    <mat-spinner *ngIf="isSavingCompanyInfo" diameter="20" aria-hidden="true"></mat-spinner>
                    {{ isSavingCompanyInfo ? 'Saving...' : 'Save Company Information' }}
                  </button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>
        </section>

        <!-- Legal Entities Section -->
        <section class="legal-entities-section" aria-labelledby="legal-entities-title">
          <div class="section-header">
            <div class="section-title-group">
              <h2 id="legal-entities-title" class="section-title">Legal Entities</h2>
              <p class="section-description">
                Manage all legal entities within your company structure
              </p>
            </div>
            
            <button 
              mat-mini-fab 
              color="primary" 
              (click)="openAddEntityModal()"
              class="add-entity-fab"
              aria-label="Add new legal entity"
              matTooltip="Add Legal Entity"
              matTooltipPosition="left">
              <mat-icon>add</mat-icon>
            </button>
          </div>

          <div *ngIf="isLoadingEntities" class="loading-spinner">
            <mat-spinner diameter="40" aria-label="Loading legal entities"></mat-spinner>
            <p class="sr-only">Loading legal entities</p>
          </div>

          <div 
            *ngIf="!isLoadingEntities && legalEntities.length === 0" 
            class="empty-state">
            <mat-icon class="empty-icon" aria-hidden="true">business_center</mat-icon>
            <h3>No Legal Entities</h3>
            <p>Start by adding your first legal entity to build your company structure.</p>
            <button 
              mat-raised-button 
              color="primary" 
              (click)="openAddEntityModal()"
              class="add-first-entity-button">
              <mat-icon aria-hidden="true">add</mat-icon>
              Add First Legal Entity
            </button>
          </div>

          <div 
            *ngIf="!isLoadingEntities && legalEntities.length > 0" 
            class="entities-grid responsive-grid"
            role="grid"
            aria-label="Legal entities grid">
            
            <mat-card 
              *ngFor="let entity of legalEntities; trackBy: trackByEntityId" 
              class="entity-card fade-in-up"
              role="gridcell"
              [attr.aria-label]="'Legal entity: ' + entity.name">
              
              <mat-card-header>
                <div mat-card-avatar class="entity-avatar">
                  <mat-icon [attr.aria-label]="'Entity type: ' + entity.type">
                    {{ getEntityIcon(entity.type) }}
                  </mat-icon>
                </div>
                
                <mat-card-title>{{ entity.name }}</mat-card-title>
                <mat-card-subtitle>{{ entity.type }}</mat-card-subtitle>
              </mat-card-header>

              <mat-card-content>
                <div class="entity-details">
                  <div class="detail-item">
                    <mat-icon class="detail-icon" aria-hidden="true">confirmation_number</mat-icon>
                    <span class="detail-label">Registration:</span>
                    <span class="detail-value">{{ entity.registrationNumber }}</span>
                  </div>

                  <div class="detail-item">
                    <mat-icon class="detail-icon" aria-hidden="true">location_on</mat-icon>
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">{{ entity.address.city }}, {{ entity.address.country }}</span>
                  </div>

                  <div class="detail-item">
                    <mat-icon class="detail-icon" aria-hidden="true">people</mat-icon>
                    <span class="detail-label">Employees:</span>
                    <span class="detail-value">{{ entity.employeeCount | number }}</span>
                  </div>

                  <div class="detail-item">
                    <mat-icon class="detail-icon" aria-hidden="true">person</mat-icon>
                    <span class="detail-label">Contact:</span>
                    <span class="detail-value">{{ entity.contactPerson.name }}</span>
                  </div>
                </div>

                <div class="entity-status">
                  <mat-chip 
                    [class]="'status-chip status-' + entity.status.toLowerCase()"
                    [attr.aria-label]="'Status: ' + entity.status">
                    {{ entity.status }}
                  </mat-chip>
                </div>
              </mat-card-content>

              <mat-card-actions align="end">
                <button 
                  mat-button 
                  color="primary"
                  (click)="onEditEntity(entity)"
                  [disabled]="isDeletingEntity === entity.id"
                  matTooltip="Edit legal entity"
                  class="action-button">
                  <mat-icon aria-hidden="true">edit</mat-icon>
                  Edit
                </button>
                <button 
                  mat-button 
                  color="warn"
                  (click)="onDeleteEntity(entity)"
                  [disabled]="isDeletingEntity === entity.id"
                  matTooltip="Delete legal entity"
                  class="action-button delete-button">
                  <mat-spinner 
                    *ngIf="isDeletingEntity === entity.id" 
                    diameter="16" 
                    aria-hidden="true">
                  </mat-spinner>
                  <mat-icon *ngIf="isDeletingEntity !== entity.id" aria-hidden="true">delete</mat-icon>
                  {{ isDeletingEntity === entity.id ? 'Deleting...' : 'Delete' }}
                </button>
              </mat-card-actions>
            </mat-card>
          </div>
        </section>
      </div>

      <!-- Add Legal Entity Modal -->
      <app-add-legal-entity-modal
        [isOpen]="isAddModalOpen"
        (closeModal)="closeAddEntityModal()"
        (entityAdded)="onEntityAdded($event)">
      </app-add-legal-entity-modal>

      <!-- Edit Legal Entity Modal -->
      <app-edit-legal-entity-modal
        [isOpen]="isEditModalOpen"
        [entity]="selectedEntity"
        (closeModal)="closeEditEntityModal()"
        (entityUpdated)="onEntityUpdated($event)">
      </app-edit-legal-entity-modal>
    </div>
  `,
  styles: [`
    .company-structure-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }

    .page-header {
      background: linear-gradient(135deg, #9E7FFF 0%, #7c3aed 100%);
      color: white;
      padding: 48px 24px;
      text-align: center;
    }

    .header-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .page-title {
      font-size: 2.5rem;
      font-weight: 600;
      margin: 0 0 16px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .page-description {
      font-size: 1.125rem;
      opacity: 0.9;
      margin: 0;
      line-height: 1.6;
    }

    .content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 24px;
      display: flex;
      flex-direction: column;
      gap: 48px;
    }

    .company-info-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
    }

    .company-info-card mat-card-header {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 24px;
    }

    .company-info-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.5rem;
      font-weight: 600;
      color: #171717;
    }

    .company-info-card mat-card-subtitle {
      margin-top: 8px;
      color: #737373;
    }

    .company-form {
      padding: 24px;
    }

    /* Pure HTML Form Styles */
    .form-group {
      margin-bottom: 20px;
      position: relative;
    }

    .form-label {
      display: block;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
      font-size: 14px;
      cursor: pointer;
    }

    .pure-input,
    .pure-textarea {
      width: 100% !important;
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
    }

    .pure-input:focus,
    .pure-textarea:focus {
      border-color: #9E7FFF;
      box-shadow: 0 0 0 3px rgba(158, 127, 255, 0.1);
    }

    .pure-input:hover,
    .pure-textarea:hover {
      border-color: #9ca3af;
    }

    .pure-input::placeholder,
    .pure-textarea::placeholder {
      color: #9ca3af;
    }

    .pure-textarea {
      min-height: 80px;
      resize: vertical;
      font-family: 'Roboto', sans-serif;
    }

    .pure-select-wrapper {
      position: relative;
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
    }

    .form-hint {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }

    .error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
      font-weight: 500;
    }

    /* Legacy Material overrides - keep for compatibility */
    .form-field {
      width: 100% !important;
      margin-bottom: 16px !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      height: auto !important;
      min-height: 56px !important;
    }

    .form-field .mat-mdc-form-field-wrapper {
      width: 100% !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .text-input,
    .textarea-input,
    .select-input {
      width: 100% !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      background-color: white !important;
      color: #171717 !important;
      font-size: 16px !important;
      padding: 12px 16px !important;
      border: 1px solid #e5e5e5 !important;
      border-radius: 8px !important;
      box-sizing: border-box !important;
      min-height: 48px !important;
    }

    .text-input:focus,
    .textarea-input:focus {
      outline: 2px solid #9E7FFF !important;
      border-color: #9E7FFF !important;
    }

    .textarea-input {
      min-height: 80px !important;
      resize: vertical !important;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 16px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .address-section {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e5e5;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 24px 0;
      color: #171717;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e5e5;
    }

    .save-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-weight: 500;
    }

    .legal-entities-section {
      margin-top: 24px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      gap: 24px;
    }

    .section-title-group h2 {
      font-size: 2rem;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #171717;
    }

    .section-description {
      color: #737373;
      margin: 0;
      font-size: 1rem;
    }

    .add-entity-fab {
      flex-shrink: 0;
      box-shadow: 0 4px 20px rgba(158, 127, 255, 0.3);
    }

    .entities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .entity-card {
      background: white;
      transition: all 0.3s ease;
      border-radius: 16px;
      overflow: hidden;
    }

    .entity-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }

    .entity-avatar {
      background: linear-gradient(135deg, #9E7FFF 0%, #7c3aed 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;
    }

    .entity-details {
      margin: 16px 0;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      font-size: 0.875rem;
    }

    .detail-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #737373;
    }

    .detail-label {
      font-weight: 500;
      color: #737373;
      min-width: 80px;
    }

    .detail-value {
      color: #171717;
      flex: 1;
    }

    .entity-status {
      margin-top: 16px;
    }

    .status-chip {
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 12px;
    }

    .status-chip.status-active {
      background-color: #dcfce7;
      color: #166534;
    }

    .status-chip.status-inactive {
      background-color: #f3f4f6;
      color: #374151;
    }

    .status-chip.status-pending {
      background-color: #fef3c7;
      color: #92400e;
    }

    .status-chip.status-suspended {
      background-color: #fee2e2;
      color: #991b1b;
    }

    .action-button {
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .delete-button {
      color: #dc2626 !important;
    }

    .delete-button:hover:not(:disabled) {
      background-color: rgba(220, 38, 38, 0.1) !important;
    }

    .delete-button:disabled {
      opacity: 0.6;
    }

    .empty-state {
      text-align: center;
      padding: 64px 24px;
      background: white;
      border-radius: 16px;
      border: 2px dashed #e5e5e5;
    }

    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #737373;
      margin-bottom: 24px;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #171717;
    }

    .empty-state p {
      color: #737373;
      margin: 0 0 32px 0;
      font-size: 1rem;
    }

    .add-first-entity-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (max-width: 768px) {
      .page-title {
        font-size: 2rem;
      }

      .content-wrapper {
        padding: 24px 16px;
        gap: 32px;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .add-entity-fab {
        align-self: flex-end;
      }

      .entities-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }

    @media (max-width: 480px) {
      .page-header {
        padding: 32px 16px;
      }

      .page-title {
        font-size: 1.75rem;
      }

      .company-form {
        padding: 16px;
      }
    }
  `]
})
export class CompanyStructureComponent implements OnInit, OnDestroy {
  companyForm!: FormGroup;
  companyInfo: CompanyInfo | null = null;
  legalEntities: LegalEntity[] = [];
  
  isLoadingCompanyInfo = false;
  isLoadingEntities = false;
  isSavingCompanyInfo = false;
  isAddModalOpen = false;
  isEditModalOpen = false;
  isDeletingEntity: string | null = null;
  selectedEntity: LegalEntity | null = null;
  
  currentYear = new Date().getFullYear();
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private companyService: CompanyService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      industry: ['', Validators.required],
      foundedYear: ['', [Validators.min(1800), Validators.max(this.currentYear)]],
      website: [''],
      street: [''],
      city: [''],
      postalCode: [''],
      country: ['']
    });
  }

  private loadData(): void {
    this.isLoadingCompanyInfo = true;
    this.isLoadingEntities = true;

    combineLatest([
      this.companyService.getCompanyInfo(),
      this.companyService.getLegalEntities()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([companyInfo, entities]) => {
        this.companyInfo = companyInfo;
        this.legalEntities = entities;
        
        if (companyInfo) {
          this.populateCompanyForm(companyInfo);
        }
        
        this.isLoadingCompanyInfo = false;
        this.isLoadingEntities = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.showErrorMessage('Failed to load company data');
        this.isLoadingCompanyInfo = false;
        this.isLoadingEntities = false;
      }
    });
  }

  loadEntities(): void {
    this.isLoadingEntities = true;
    this.companyService.getLegalEntities()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (entities) => {
          this.legalEntities = entities;
          this.isLoadingEntities = false;
        },
        error: (error) => {
          console.error('Error loading entities:', error);
          this.isLoadingEntities = false;
        }
      });
  }

  private populateCompanyForm(companyInfo: CompanyInfo): void {
    this.companyForm.patchValue({
      name: companyInfo.name,
      description: companyInfo.description,
      industry: companyInfo.industry,
      foundedYear: companyInfo.foundedYear,
      website: companyInfo.website,
      street: companyInfo.headquarters.street,
      city: companyInfo.headquarters.city,
      postalCode: companyInfo.headquarters.postalCode,
      country: companyInfo.headquarters.country
    });
  }

  onSaveCompanyInfo(): void {
    if (this.companyForm.invalid || !this.companyInfo) {
      return;
    }

    this.isSavingCompanyInfo = true;
    const formValue = this.companyForm.value;

    const updatedCompanyInfo: CompanyInfo = {
      ...this.companyInfo,
      name: formValue.name,
      description: formValue.description,
      industry: formValue.industry,
      foundedYear: formValue.foundedYear,
      website: formValue.website,
      headquarters: {
        street: formValue.street,
        city: formValue.city,
        postalCode: formValue.postalCode,
        country: formValue.country
      }
    };

    this.companyService.updateCompanyInfo(updatedCompanyInfo)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSavingCompanyInfo = false)
      )
      .subscribe({
        next: (updated) => {
          this.companyInfo = updated;
          this.showSuccessMessage('Company information updated successfully');
        },
        error: (error) => {
          console.error('Error updating company info:', error);
          this.showErrorMessage('Failed to update company information');
        }
      });
  }

  openAddEntityModal(): void {
    this.isAddModalOpen = true;
  }

  closeAddEntityModal(): void {
    this.isAddModalOpen = false;
  }

  onEntityAdded(entity: LegalEntity): void {
    this.closeAddEntityModal();
    this.showSuccessMessage(`Legal entity "${entity.name}" added successfully`);
    // Reload the entities from the service to get the updated list
    this.loadEntities();
  }

  onEditEntity(entity: LegalEntity): void {
    this.selectedEntity = entity;
    this.isEditModalOpen = true;
  }

  closeEditEntityModal(): void {
    this.isEditModalOpen = false;
    this.selectedEntity = null;
  }

  onEntityUpdated(updatedEntity: LegalEntity): void {
    const index = this.legalEntities.findIndex(e => e.id === updatedEntity.id);
    if (index !== -1) {
      this.legalEntities = [
        ...this.legalEntities.slice(0, index),
        updatedEntity,
        ...this.legalEntities.slice(index + 1)
      ];
    }
    this.closeEditEntityModal();
    this.showSuccessMessage(`Legal entity "${updatedEntity.name}" updated successfully`);
  }

  onDeleteEntity(entity: LegalEntity): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Legal Entity',
        message: `Are you sure you want to delete "${entity.name}"?`,
        details: [
          `Type: ${entity.type}`,
          `Registration: ${entity.registrationNumber}`,
          `Employees: ${entity.employeeCount}`
        ],
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteEntity(entity);
      }
    });
  }

  private deleteEntity(entity: LegalEntity): void {
    this.isDeletingEntity = entity.id;

    this.companyService.deleteLegalEntity(entity.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isDeletingEntity = null)
      )
      .subscribe({
        next: () => {
          this.legalEntities = this.legalEntities.filter(e => e.id !== entity.id);
          this.showSuccessMessage(`Legal entity "${entity.name}" deleted successfully`);
        },
        error: (error) => {
          console.error('Error deleting entity:', error);
          this.showErrorMessage(`Failed to delete "${entity.name}"`);
        }
      });
  }

  getEntityIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'Corporation': 'corporate_fare',
      'Limited Liability Company': 'business',
      'Partnership': 'handshake',
      'Subsidiary': 'account_tree',
      'Branch Office': 'location_city',
      'Division': 'workspaces'
    };
    return iconMap[type] || 'business';
  }

  trackByEntityId(index: number, entity: LegalEntity): string {
    return entity.id;
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  private showInfoMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }
}
