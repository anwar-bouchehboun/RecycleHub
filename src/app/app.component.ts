import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { InitDataService } from './service/init-data.service';
import { Store } from '@ngrx/store';
import { loginSuccess } from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatButtonModule, MatCardModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'recycleProjet';

  constructor(private initDataService: InitDataService, private store: Store) {}

  ngOnInit() {
    // Charger l'utilisateur depuis le localStorage
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      this.store.dispatch(loginSuccess({ user }));
    }
  }
}
