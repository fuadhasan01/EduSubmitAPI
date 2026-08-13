import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavItem } from './navigation.types';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar" [class.open]="isOpen()">
      <ul class="nav-list">
        @for (item of navItems(); track item.route) {
          <li class="nav-item">
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{
                exact:
                  item.route === '/admin' || item.route === '/teacher' || item.route === '/student',
              }"
              (click)="closeSidebar.emit()"
            >
              <span class="material-icons">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: [
    `
      .sidebar {
        position: fixed;
        top: 64px;
        left: 0;
        width: 240px;
        height: calc(100vh - 64px);
        background: #f5f5f5;
        border-right: 1px solid #e0e0e0;
        padding: 1rem 0;
        overflow-y: auto;
        transition: transform 0.3s ease;
        z-index: 100;
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .nav-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .nav-item {
        margin: 0.25rem 0.75rem;
      }

      .nav-item a {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.6rem 1rem;
        border-radius: 8px;
        color: #333;
        text-decoration: none;
        font-weight: 500;
        transition:
          background 0.2s,
          color 0.2s;
      }

      .nav-item a:hover {
        background: #e8eaf6;
        color: #1a237e;
      }

      .nav-item a.active {
        background: #1a237e;
        color: #fff;
      }

      .nav-item a .material-icons {
        font-size: 24px;
      }

      .nav-label {
        font-size: 0.95rem;
      }

      @media (max-width: 768px) {
        .sidebar {
          transform: translateX(-100%);
          width: 260px;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
        }

        .sidebar.open {
          transform: translateX(0);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  navItems = input.required<NavItem[]>();
  isOpen = input<boolean>(false);
  closeSidebar = output<void>();
}
