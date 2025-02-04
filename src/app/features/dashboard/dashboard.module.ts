import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DASHBOARD_ROUTES } from './dashboard.routes';

@NgModule({
  imports: [CommonModule, RouterModule.forChild(DASHBOARD_ROUTES), FormsModule],
  exports: [RouterModule],
})
export class DashboardModule {}
