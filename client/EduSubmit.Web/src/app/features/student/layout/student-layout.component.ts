import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LayoutComponent } from '../../../core/layout/layout.component';
import { getStudentNavItems } from '../../../core/layout/nav-items';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [LayoutComponent],
  template: `<app-layout [navItems]="navItems" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentLayoutComponent {
  navItems = getStudentNavItems();
}
