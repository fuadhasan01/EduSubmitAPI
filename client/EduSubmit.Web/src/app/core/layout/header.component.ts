import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthState } from '../auth/auth-state.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="header">
      <div class="header-left">
        <button class="menu-toggle" (click)="toggleSidebar.emit()" aria-label="Toggle sidebar">
          <span class="material-icons">menu</span>
        </button>
        <span class="app-name"> <span class="app-icon">📘</span> EduSubmit </span>
      </div>
      <div class="header-right">
        <div class="user-info">
          <div class="user-avatar" [style.background]="avatarColor()">
            {{ userInitials() }}
          </div>
          <span class="user-email">{{ userEmail() }}</span>
        </div>
        <span
          class="role-badge"
          [class.admin]="role() === 'Admin'"
          [class.teacher]="role() === 'Teacher'"
          [class.student]="role() === 'Student'"
        >
          {{ role() }}
        </span>
        <button class="logout-btn" (click)="logout()">
          <span class="material-icons">logout</span>
          Logout
        </button>
      </div>
    </header>
  `,
  styles: [
    `
      .header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 102;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 2rem;
        height: 64px;
        background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
        color: #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 1.25rem;
      }

      .menu-toggle {
        display: none;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        padding: 6px 8px;
        color: #fff;
        transition: background 0.2s;
      }
      .menu-toggle:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      .menu-toggle .material-icons {
        font-size: 28px;
      }

      .app-name {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.35rem;
        font-weight: 600;
        letter-spacing: 0.3px;
      }
      .app-icon {
        font-size: 1.6rem;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.9rem;
        color: #fff;
        background: #4caf50; /* fallback, computed */
        text-transform: uppercase;
      }

      .user-email {
        font-size: 0.9rem;
        font-weight: 400;
        opacity: 0.9;
      }

      .role-badge {
        padding: 4px 14px;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        background: rgba(255, 255, 255, 0.15);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .role-badge.admin {
        background: #ff6f00;
        border-color: #ff6f00;
      }
      .role-badge.teacher {
        background: #2e7d32;
        border-color: #2e7d32;
      }
      .role-badge.student {
        background: #0d47a1;
        border-color: #0d47a1;
      }

      .logout-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #fff;
        font-weight: 500;
        cursor: pointer;
        padding: 6px 14px;
        border-radius: 8px;
        transition: all 0.2s;
      }
      .logout-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
      }
      .logout-btn .material-icons {
        font-size: 20px;
      }

      @media (max-width: 768px) {
        .header {
          padding: 0 1rem;
        }
        .menu-toggle {
          display: block;
        }
        .user-email {
          display: none;
        }
        .header-right {
          gap: 0.75rem;
        }
        .role-badge {
          padding: 2px 10px;
          font-size: 0.65rem;
        }
        .logout-btn span:not(.material-icons) {
          display: none;
        }
        .logout-btn {
          padding: 6px 10px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private authState = inject(AuthState);
  private router = inject(Router);

  role = computed(() => this.authState.role());
  userEmail = computed(() => this.authState.currentUser()?.email ?? '');
  userInitials = computed(() => {
    const email = this.userEmail();
    return email ? email.substring(0, 2).toUpperCase() : '?';
  });
  avatarColor = computed(() => {
    const colors = ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0'];
    const index = (this.userEmail()?.length ?? 0) % colors.length;
    return colors[index];
  });

  toggleSidebar = output<void>();

  logout(): void {
    this.authState.logout();
    this.router.navigate(['/login']);
  }
}
