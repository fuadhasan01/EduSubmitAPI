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
        box-sizing: border-box;

        background: #ffffff;
        border-right: 1px solid #e9ecef;
        padding: 1.25rem 0;

        /* Don't create a scrollbar unless absolutely necessary */
        overflow-y: auto;
        overflow-x: hidden;

        transition: transform 0.3s ease;
        z-index: 101;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.03);
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
        padding: 0.65rem 1.25rem;
        border-radius: 10px;
        color: #4a4a4a;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.95rem;
        transition: all 0.2s ease;
        position: relative;
      }

      .nav-item a:hover {
        background: #f0f2f5;
        color: #1a237e;
      }

      .nav-item a.active {
        background: #e8eaf6;
        color: #1a237e;
        font-weight: 600;
      }

      .nav-item a.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 20%;
        height: 60%;
        width: 4px;
        background: #1a237e;
        border-radius: 0 4px 4px 0;
      }

      .nav-item a .material-icons {
        font-size: 24px;
        color: #6c757d;
        transition: color 0.2s;
      }
      .nav-item a.active .material-icons {
        color: #1a237e;
      }
      .nav-item a:hover .material-icons {
        color: #1a237e;
      }

      .nav-label {
        flex: 1;
      }

      @media (max-width: 768px) {
        .sidebar {
          transform: translateX(-100%);
          width: 280px;
          box-shadow: 2px 0 16px rgba(0, 0, 0, 0.08);
        }
        .sidebar.open {
          transform: translateX(0);
        }
      }

      /* Scrollbar styling */
      .sidebar::-webkit-scrollbar {
        width: 4px;
      }
      .sidebar::-webkit-scrollbar-thumb {
        background: #c4c4c4;
        border-radius: 4px;
      }
      .sidebar::-webkit-scrollbar-track {
        background: transparent;
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
