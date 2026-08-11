import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (totalPages() > 1) {
      <nav class="pagination" aria-label="Pagination">
        <button
          type="button"
          [disabled]="!hasPreviousPage()"
          (click)="pageChanged.emit(currentPage() - 1)"
        >
          Previous
        </button>

        @for (page of pages(); track page) {
          <button
            type="button"
            [class.active]="page === currentPage()"
            (click)="pageChanged.emit(page)"
          >
            {{ page }}
          </button>
        }

        <button
          type="button"
          [disabled]="!hasNextPage()"
          (click)="pageChanged.emit(currentPage() + 1)"
        >
          Next
        </button>
      </nav>
    }
  `,
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly currentPage = input(1);
  readonly totalPages = input(1);
  readonly hasPreviousPage = input(false);
  readonly hasNextPage = input(false);

  readonly pageChanged = output<number>();

  protected readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );
}
