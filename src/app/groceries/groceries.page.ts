import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-groceries',
  templateUrl: './groceries.page.html',
  styleUrls: ['./groceries.page.scss'],
})
export class GroceriesPage implements OnInit {

  lastPage = '';

  constructor(private route: ActivatedRoute,
              private router: Router,) {

    this.route.queryParams.subscribe(async params => {
    if (this.router.getCurrentNavigation().extras.state) {
      this.lastPage = this.router.getCurrentNavigation().extras.state.lastPage;
    }

    })
  }

  ngOnInit() {
  }

}
