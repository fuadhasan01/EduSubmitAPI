import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LayoutComponent } from '../../../core/layout/layout.component';
import { getTeacherNavItems } from '../../../core/layout/nav-items';

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [LayoutComponent],
  template: `<app-layout [navItems]="navItems" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherLayoutComponent {
  navItems = getTeacherNavItems();
}
