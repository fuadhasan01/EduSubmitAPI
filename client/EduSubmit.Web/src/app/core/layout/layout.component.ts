import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';
import { NavItem } from './navigation.types';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="layout">
      <app-header (toggleSidebar)="toggleSidebar()" />
      <div class="layout-body">
        <app-sidebar
          [navItems]="navItems()"
          [isOpen]="isSidebarOpen()"
          (closeSidebar)="closeSidebarOnMobile()"
        />
        <main class="main-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .layout {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .layout-body {
        display: flex;
        flex: 1;
        padding-top: 64px; /* header height */
      }

      .main-content {
        flex: 1;
        padding: 2rem;
        background: #f8f9fc;
        margin-left: 240px; /* sidebar width */
        min-height: calc(100vh - 64px);
        transition: margin-left 0.3s ease;
      }

      @media (max-width: 768px) {
        .main-content {
          margin-left: 0;
          padding: 1rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  navItems = input.required<NavItem[]>();
  isSidebarOpen = signal(false);

  toggleSidebar(): void {
    this.isSidebarOpen.update((v) => !v);
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth <= 768) {
      this.isSidebarOpen.set(false);
    }
  }
}
