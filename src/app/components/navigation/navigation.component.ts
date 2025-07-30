import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="navigation-toolbar">
      <div class="toolbar-content">
        <div class="brand-section">
          <mat-icon class="brand-icon" aria-hidden="true">how_to_vote</mat-icon>
          <span class="brand-text">Social Elections</span>
        </div>
        
        <nav class="navigation-menu" role="navigation" aria-label="Main navigation">
          <a 
            mat-button 
            routerLink="/company-structure" 
            routerLinkActive="active-link"
            class="nav-link"
            [attr.aria-current]="isCurrentPage('/company-structure') ? 'page' : null"
            matTooltip="Manage company structure and legal entities"
            matTooltipPosition="below">
            <mat-icon aria-hidden="true">business</mat-icon>
            <span>Company Structure</span>
          </a>
          
          <button 
            mat-button 
            class="nav-link"
            disabled
            matTooltip="Coming soon - Manage elections"
            matTooltipPosition="below">
            <mat-icon aria-hidden="true">poll</mat-icon>
            <span>Elections</span>
          </button>
          
          <button 
            mat-button 
            class="nav-link"
            disabled
            matTooltip="Coming soon - View reports and analytics"
            matTooltipPosition="below">
            <mat-icon aria-hidden="true">analytics</mat-icon>
            <span>Reports</span>
          </button>
        </nav>

        <div class="user-section">
          <button 
            mat-icon-button 
            [matMenuTriggerFor]="userMenu"
            class="user-menu-trigger"
            aria-label="User menu"
            matTooltip="User options"
            matTooltipPosition="below">
            <mat-icon>account_circle</mat-icon>
          </button>
          
          <mat-menu #userMenu="matMenu" class="user-menu">
            <button mat-menu-item disabled>
              <mat-icon>person</mat-icon>
              <span>Profile</span>
            </button>
            <button mat-menu-item disabled>
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item disabled>
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navigation-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      background: linear-gradient(135deg, #9E7FFF 0%, #7c3aed 100%);
    }

    .toolbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .brand-section {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 600;
      font-size: 1.25rem;
    }

    .brand-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .brand-text {
      color: white;
      text-decoration: none;
    }

    .navigation-menu {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .nav-link:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-link:focus {
      outline: 2px solid white;
      outline-offset: 2px;
    }

    .nav-link.active-link {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .nav-link:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .user-section {
      display: flex;
      align-items: center;
    }

    .user-menu-trigger {
      color: white;
    }

    .user-menu-trigger:focus {
      outline: 2px solid white;
      outline-offset: 2px;
    }

    @media (max-width: 768px) {
      .toolbar-content {
        padding: 0 8px;
      }
      
      .navigation-menu {
        gap: 4px;
      }
      
      .nav-link span {
        display: none;
      }
      
      .brand-text {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .navigation-menu {
        display: none;
      }
    }
  `]
})
export class NavigationComponent {
  isCurrentPage(route: string): boolean {
    return window.location.pathname === route;
  }
}
