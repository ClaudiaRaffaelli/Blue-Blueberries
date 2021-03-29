import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  openGroceryList(){
    const navigationExtras: NavigationExtras = {
      state: {
        lastPage: 'settings'
      }
    };
    this.router.navigate(['groceries'], navigationExtras);
  }

  openPreferences(){
    const navigationExtras: NavigationExtras = {
      state: {
        lastPage: 'settings'
      }
    };
    this.router.navigate(['preferences'], navigationExtras);
  }
}


