import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthState } from '../../../core/auth/auth-state.service';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = signal(false);
  protected readonly serverError = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.serverError.set(null);

    this.authState.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.redirectAfterLogin();
      },
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(
          err?.error?.detail ??
            err?.error?.title ??
            err?.error?.message ??
            'Invalid email or password.',
        );
      },
    });
  }

  private redirectAfterLogin(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const defaultRoute = this.getDefaultRouteForRole(this.authState.role());
    this.router.navigateByUrl(returnUrl ?? defaultRoute);
  }

  private getDefaultRouteForRole(role: string | null): string {
    switch (role) {
      case 'Admin':
        return '/admin';
      case 'Teacher':
        return '/teacher';
      case 'Student':
        return '/student';
      default:
        return '/login';
    }
  }

  protected readonly currentYear = signal(new Date().getFullYear());
}
