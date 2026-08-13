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
        <span class="app-name">EduSubmit</span>
      </div>
      <div class="header-right">
        <span class="role-badge">{{ role() }}</span>
        <span class="user-email">{{ userEmail() }}</span>
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
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1.5rem;
        height: 64px;
        background: #fff;
        border-bottom: 1px solid #e0e0e0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .menu-toggle {
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
      }

      .menu-toggle .material-icons {
        font-size: 28px;
        color: #333;
      }

      .app-name {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1a237e;
        letter-spacing: 0.5px;
      }

      .header-right {
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }

      .role-badge {
        background: #e8eaf6;
        color: #1a237e;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .user-email {
        font-size: 0.9rem;
        color: #555;
      }

      .logout-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        color: #d32f2f;
        font-weight: 500;
        cursor: pointer;
        padding: 6px 12px;
        border-radius: 4px;
        transition: background 0.2s;
      }

      .logout-btn:hover {
        background: #ffebee;
      }

      .logout-btn .material-icons {
        font-size: 20px;
      }

      @media (max-width: 768px) {
        .menu-toggle {
          display: block;
        }

        .user-email {
          display: none;
        }

        .header-right {
          gap: 0.5rem;
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

  toggleSidebar = output<void>();

  logout(): void {
    this.authState.logout();
    this.router.navigate(['/login']);
  }
}
