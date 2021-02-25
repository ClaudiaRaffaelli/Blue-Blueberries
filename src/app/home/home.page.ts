import {Component, OnInit} from '@angular/core';
import { RecipeItem } from '../shared/recipeItem';
import { RecipeItemService } from './../shared/recipe-item.service';
import firebase from 'firebase';
import 'firebase/storage'; // in order to use images stored in the firebase database
import { Router, NavigationExtras } from '@angular/router'; // pass data between two pages

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {
  recipes = []; // Here are going to be saved all the recipes downloaded from the database
  pathReference: any;
  imgs: []; // Title images downloaded from the firebase storage

  constructor(
    private aptService: RecipeItemService,
    private router: Router
  ) { }

  ngOnInit() {
    this.fetchRecipeItems();
    const recipesRes = this.aptService.getRecipesList();
    recipesRes.snapshotChanges().subscribe(res => {
      this.recipes = [];
      res.forEach(item => {
        const a = item.payload.toJSON();
        // @ts-ignore
        a.$key = item.key;

        this.pathReference = firebase.storage().ref().child(item.key + '/' + item.key + '_0.jpg').getDownloadURL().then(url => {
          this.imgs = url;
          // @ts-ignore
          a.title_image = this.imgs;
        });
        this.recipes.push(a as RecipeItem);
      });
    });
  }


  openRecipe(recipeP: any){
    const navigationExtras: NavigationExtras = {
      state: {
        recipe: recipeP
      }
    };
    this.router.navigate(['view-recipe'], navigationExtras);

  }

  fetchRecipeItems() {
    this.aptService.getRecipesList().valueChanges().subscribe(res => {
    });
  }

  deleteRecipeItem(id) {
    if (window.confirm('Do you really want to delete?')) {
      this.aptService.deleteRecipe(id);
    }
  }
}
