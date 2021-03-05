import {Component, OnInit} from '@angular/core';
import {IngredientsDic, RecipeItem} from '../shared/recipeItem';
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

  // Options for images slider
  option = {
    slidesPerView: 1.2,
    centeredSlides: true,
    loop: false,
    spaceBetween: 2,
  };

  constructor(
    private aptService: RecipeItemService,
    private router: Router
  ) { }


  ngOnInit() {
    // const myIngredients = new IngredientsDic();
    // const tortaAlleMele = new IngredientsDic();
    //
    // myIngredients.ingredients['apple'] = true;
    // tortaAlleMele.ingredients['apple'] = true;
    // //console.log(myIngredients.ingredients);
    //
    // for (const key in myIngredients.ingredients){
    //   if ( !myIngredients.ingredients[key] && tortaAlleMele.ingredients[key]){
    //     console.log('Non puoi farla');
    //     break;
    //   }
    // }



    this.fetchRecipeItems();
    const recipesRes = this.aptService.getRecipesList();
    recipesRes.snapshotChanges().subscribe(res => {
      this.recipes = [];
      res.forEach(item => {
        const myRecipeItem = item.payload.toJSON();
        // @ts-ignore
        myRecipeItem.$key = item.key;
        // get title image
        this.pathReference = firebase.storage().ref().child(item.key + '/' + item.key + '_0.jpg').getDownloadURL().then(url => {
          this.imgs = url;
          // @ts-ignore
          myRecipeItem.title_image = this.imgs;
        });

        // @ts-ignore
        if ((myRecipeItem.recipeTime as RecipeItem) < 20000000000) {
          this.recipes.push(myRecipeItem as RecipeItem);
        }
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
