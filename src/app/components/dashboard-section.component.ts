import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { RouterModule } from '@angular/router';
//Child of the dashboard section component
@Component({
  selector: 'app-dashboard-section',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    RouterModule,
  ],
  template: `
    <mat-card
      class="h-full rounded-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl"
      [ngClass]="[
        'dashboard-section',
        'backdrop-blur-sm',
        'bg-opacity-95',
        colorClass
      ]"
    >
      <mat-card-header
        [ngClass]="[
          'p-6 rounded-t-2xl border-b',
          'flex items-center',
          headerClass
        ]"
      >
        <div
          class="flex justify-center items-center mr-4 w-12 h-12 rounded-xl shadow-lg"
          [ngClass]="iconWrapperClass"
        >
          <mat-icon
            class="transition-transform duration-300 transform hover:scale-110"
            [ngClass]="iconColor"
          >
            {{ icon }}
          </mat-icon>
        </div>
        <mat-card-title class="text-xl font-bold tracking-tight">
          {{ title }}
        </mat-card-title>
      </mat-card-header>

      <mat-card-content class="flex flex-col p-6 h-full">
        <ng-container *ngIf="showMetric">
          <div class="flex-grow mb-6">
            <p
              class="mb-2 text-3xl font-extrabold text-transparent bg-clip-text"
              [ngClass]="metricClass"
            >
              {{ metricValue }}
            </p>
            <p class="text-gray-600 dark:text-gray-300">{{ description }}</p>
          </div>
        </ng-container>
        <ng-container *ngIf="!showMetric">
          <p class="flex-grow mb-6 text-gray-600 dark:text-gray-300">
            {{ description }}
          </p>
        </ng-container>

        <button
          mat-flat-button
          [color]="buttonColor"
          [routerLink]="routerLink"
          class="py-3 w-full font-medium tracking-wide rounded-xl transition-all duration-300 hover:shadow-lg"
          (click)="onActionClick()"
        >
          <div class="flex justify-center items-center space-x-2">
            <mat-icon
              class="transition-transform transform group-hover:scale-110"
            >
              {{ actionIcon }}
            </mat-icon>
            <span>{{ actionLabel }}</span>
          </div>
        </button>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .dashboard-section {
        @apply bg-white dark:bg-gray-800;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .blue-gradient {
        @apply border border-blue-100 dark:border-blue-800;
      }

      .green-gradient {
        @apply border border-green-100 dark:border-green-800;
      }

      .header-blue {
        @apply bg-blue-50 dark:bg-blue-900/30 border-blue-100 dark:border-blue-800;
      }

      .header-green {
        @apply bg-green-50 dark:bg-green-900/30 border-green-100 dark:border-green-800;
      }

      .icon-wrapper-blue {
        @apply bg-blue-100 dark:bg-blue-900;
      }

      .icon-wrapper-green {
        @apply bg-green-100 dark:bg-green-900;
      }

      .icon-blue {
        @apply text-blue-600 dark:text-blue-400;
      }

      .icon-green {
        @apply text-green-600 dark:text-green-400;
      }

      .metric-blue {
        @apply bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400;
      }

      .metric-green {
        @apply bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400;
      }
    `,
  ],
})
export class DashboardSectionComponent {
  
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() icon: string = '';
  @Input() actionIcon: string = '';
  @Input() actionLabel: string = '';
  @Input() routerLink: string = '';
  @Input() colorTheme: 'blue' | 'green' = 'blue';
  @Input() showMetric: boolean = false;
  @Input() metricValue: string = '';

  @Output() action = new EventEmitter<void>();

  get colorClass(): string {
    return this.colorTheme === 'blue' ? 'blue-gradient' : 'green-gradient';
  }

  get headerClass(): string {
    return this.colorTheme === 'blue' ? 'header-blue' : 'header-green';
  }

  get iconWrapperClass(): string {
    return this.colorTheme === 'blue'
      ? 'icon-wrapper-blue'
      : 'icon-wrapper-green';
  }

  get iconColor(): string {
    return this.colorTheme === 'blue' ? 'icon-blue' : 'icon-green';
  }

  get metricClass(): string {
    return this.colorTheme === 'blue' ? 'metric-blue' : 'metric-green';
  }

  get buttonColor(): string {
    return this.colorTheme === 'blue' ? 'primary' : 'accent';
  }

  onActionClick(): void {
    this.action.emit();
  }
}
