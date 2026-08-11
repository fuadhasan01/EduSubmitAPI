import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface TableColumn<T> {
  key: keyof T;
  label: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  template: `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            @for (column of columns(); track column.key) {
              <th>{{ column.label }}</th>
            }
          </tr>
        </thead>

        <tbody>
          @for (row of rows(); track trackRow($index, row)) {
            <tr (click)="rowClicked.emit(row)">
              @for (column of columns(); track column.key) {
                <td>{{ row[column.key] }}</td>
              }
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="columns().length">No data available.</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent<T extends object> {
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly rows = input<readonly T[]>([]);
  readonly rowClicked = output<T>();

  protected trackRow(index: number, row: T): unknown {
    if ('id' in row) {
      return row.id ?? index;
    }

    return index;
  }
}
