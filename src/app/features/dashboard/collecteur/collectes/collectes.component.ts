import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-collectes',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="container p-4 mx-auto">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Mes Collectes</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <!-- Contenu de vos collectes ici -->
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class CollectesComponent {
  // Logique du composant ici
}
