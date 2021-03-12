import { Component, OnInit } from '@angular/core';
import {IngredientsDic, RecipeItem} from '../shared/recipeItem';
import { RecipeItemService } from './../shared/recipe-item.service';
import firebase from 'firebase';
import 'firebase/storage'; // in order to use images stored in the firebase database
import {Router, NavigationExtras, ActivatedRoute} from '@angular/router'; // pass data between two pages

@Component({
  selector: 'app-view-collection',
  templateUrl: './view-collection.page.html',
  styleUrls: ['./view-collection.page.scss'],
})

export class ViewCollectionPage implements OnInit {
  recipes = []; // Here are going to be saved all the recipes downloaded from the database for this specific collection
  pathReference: any;
  imgs: []; // Title images downloaded from the firebase storage
  collection = {}; // collection got from custom collection page

  constructor(
      private aptService: RecipeItemService,
      private route: ActivatedRoute,
      private router: Router
  ) { this.route.queryParams.subscribe(async params => {

    if (this.router.getCurrentNavigation().extras.state) {
      this.recipes = []
      this.collection = this.router.getCurrentNavigation().extras.state.collection;

        var database = firebase.database().ref();
        for (let recipeKey of this.collection["recipeList"]){

          const myRecipeItem = await database.child("recipes").child(recipeKey).get().then(function(snapshot) {
            if (snapshot.exists()) {
              const myRecipeItem = snapshot.val();
              // @ts-ignore
              myRecipeItem.$key = recipeKey;
              return myRecipeItem
            }
            else {
              console.log("No data available");
            }
          }).catch(function(error) {
            console.error(error);
          });

          // get title image
          this.pathReference = firebase.storage().ref().child(recipeKey + '/' + recipeKey + '_0.jpg').getDownloadURL().then(url => {
            this.imgs = url;
            // @ts-ignore
            myRecipeItem.title_image = this.imgs;
          });
          this.recipes.push(myRecipeItem as RecipeItem);
        }
      }
    });
  }

  ngOnInit() {}

  openRecipe(recipeP: any){
    const navigationExtras: NavigationExtras = {
      state: {
        recipe: recipeP
      }
    };
    this.router.navigate(['view-recipe'], navigationExtras);

  }
}

