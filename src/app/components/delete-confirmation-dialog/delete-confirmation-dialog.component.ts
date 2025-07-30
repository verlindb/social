import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DeleteConfirmationData {
  title: string;
  message: string;
  details?: string[];
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-delete-confirmation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="delete-dialog">
      <div class="dialog-header">
        <div class="warning-icon">
          <mat-icon aria-hidden="true">warning</mat-icon>
        </div>
        <h2 mat-dialog-title class="dialog-title">{{ data.title }}</h2>
      </div>

      <mat-dialog-content class="dialog-content">
        <p class="dialog-message">{{ data.message }}</p>
        
        <div *ngIf="data.details && data.details.length > 0" class="entity-details">
          <h4 class="details-title">Entity Details:</h4>
          <ul class="details-list">
            <li *ngFor="let detail of data.details" class="detail-item">
              {{ detail }}
            </li>
          </ul>
        </div>

        <div class="warning-notice">
          <mat-icon class="notice-icon" aria-hidden="true">info</mat-icon>
          <span class="notice-text">This action cannot be undone.</span>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button 
          mat-button 
          (click)="onCancel()"
          class="cancel-button"
          cdkFocusInitial>
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button 
          mat-raised-button 
          color="warn"
          (click)="onConfirm()"
          class="confirm-button">
          <mat-icon aria-hidden="true">delete</mat-icon>
          {{ data.confirmText || 'Delete' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .delete-dialog {
      padding: 0;
      max-width: 400px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px 24px 16px 24px;
      border-bottom: 1px solid #f3f4f6;
    }

    .warning-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #fef2f2;
      color: #dc2626;
      flex-shrink: 0;
    }

    .warning-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .dialog-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #171717;
      margin: 0;
    }

    .dialog-content {
      padding: 24px;
    }

    .dialog-message {
      font-size: 1rem;
      color: #374151;
      margin: 0 0 20px 0;
      line-height: 1.5;
    }

    .entity-details {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .details-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 12px 0;
    }

    .details-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .detail-item {
      font-size: 0.875rem;
      color: #6b7280;
      padding: 4px 0;
      border-left: 3px solid #e5e7eb;
      padding-left: 12px;
      margin-bottom: 8px;
    }

    .detail-item:last-child {
      margin-bottom: 0;
    }

    .warning-notice {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background-color: #fffbeb;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      margin-top: 16px;
    }

    .notice-icon {
      color: #f59e0b;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .notice-text {
      font-size: 0.875rem;
      color: #92400e;
      font-weight: 500;
    }

    .dialog-actions {
      padding: 16px 24px 24px 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid #f3f4f6;
    }

    .cancel-button {
      color: #6b7280;
      font-weight: 500;
    }

    .cancel-button:hover {
      background-color: #f9fafb;
    }

    .confirm-button {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
      background-color: #dc2626 !important;
      color: white !important;
    }

    .confirm-button:hover {
      background-color: #b91c1c !important;
    }

    .confirm-button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    /* Focus styles for accessibility */
    .cancel-button:focus,
    .confirm-button:focus {
      outline: 2px solid #9E7FFF;
      outline-offset: 2px;
    }

    /* Animation */
    .delete-dialog {
      animation: slideIn 0.2s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class DeleteConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteConfirmationData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
