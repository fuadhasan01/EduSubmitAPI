import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  template: `
    <div class="form-field">
      @if (label()) {
        <label [for]="id()">
          {{ label() }}

          @if (required()) {
            <span aria-hidden="true">*</span>
          }
        </label>
      }

      <ng-content />

      @if (error()) {
        <small class="error" [id]="id() + '-error'">
          {{ error() }}
        </small>
      }

      @if (hint() && !error()) {
        <small class="hint">{{ hint() }}</small>
      }
    </div>
  `,
  styleUrl: './form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {
  readonly id = input('');
  readonly label = input('');
  readonly hint = input('');
  readonly error = input('');
  readonly required = input(false);
}
