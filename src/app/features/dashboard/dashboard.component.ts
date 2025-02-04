import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { User } from '../../models/user.model';
import { selectUser } from '../../store/auth/auth.selectors';
import * as AuthActions from '../../store/auth/auth.actions';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  userName!: string;
  userRole!: string;
  user!: User;
  imageUrl!: string;
  isMobile = false;

  user$ = this.store.select(selectUser);

  constructor(
    private store: Store,
    private breakpointObserver: BreakpointObserver
  ) {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  ngOnInit() {
    this.user$.subscribe((user) => {
      if (user) {
        this.userName = user.nom;
        this.userRole = user.role;
        this.user = user;
        this.imageUrl = user.photoUrl || 'assets/image.png';
      }
    });
  }

  onLogout() {
    this.store.dispatch(AuthActions.logout());
  }
}
