import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  template: `
    <div class="card">
      <div class="card-icon">
        <span class="material-icons">{{ icon() }}</span>
      </div>
      <div class="card-content">
        <span class="card-label">{{ label() }}</span>
        <span class="card-value">{{ value() }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      .card {
        background: #fff;
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        gap: 1rem;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
        cursor: default;
      }
      .card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      .card-icon {
        background: #e8eaf6;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #1a237e;
      }
      .card-icon .material-icons {
        font-size: 28px;
      }
      .card-content {
        display: flex;
        flex-direction: column;
      }
      .card-label {
        font-size: 0.85rem;
        color: #777;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .card-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1a237e;
        margin-top: 0.1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCardComponent {
  icon = input.required<string>();
  label = input.required<string>();
  value = input.required<number | string>();
}
