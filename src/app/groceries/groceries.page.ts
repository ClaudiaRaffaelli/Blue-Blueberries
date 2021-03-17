import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Storage} from "@ionic/storage";

@Component({
  selector: 'app-groceries',
  templateUrl: './groceries.page.html',
  styleUrls: ['./groceries.page.scss'],
})
export class GroceriesPage implements OnInit {

  lastPage = '';

  constructor(private route: ActivatedRoute,
              private router: Router,
              private storage: Storage) {

    this.route.queryParams.subscribe(async params => {
    if (this.router.getCurrentNavigation().extras.state) {
      this.lastPage = this.router.getCurrentNavigation().extras.state.lastPage;
    }

    })
  }

  ngOnInit() {
  }









}
