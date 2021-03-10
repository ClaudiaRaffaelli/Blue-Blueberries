import { Component, OnInit } from '@angular/core';
import firebase from 'firebase';
import {RecipeItemService} from '../shared/recipe-item.service';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {RecipeItem} from '../shared/recipeItem';

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.page.html',
  styleUrls: ['./presentation.page.scss'],
})
export class PresentationPage implements OnInit {
  recipes = [];
  randomSuggestions = [];
  pathReference: any;
  recipeKeys: [];
  recipesRes: any;
  imgs: []; // Title images downloaded from the firebase storage
  suggestionsNumber = 3; // suggested recipes
  dataFetched: boolean; // flag that indicates when all recipes data have been downloaded from the database

  // Options for images slider
  option = {
    slidesPerView: 1.2,
    centeredSlides: true,
    loop: false,
    spaceBetween: 1,
  };

  constructor(
      private aptService: RecipeItemService,
      private route: ActivatedRoute,
      private router: Router) {
  }


  ngOnInit() {
    this.recipesRes = this.aptService.getRecipesList();
    this.recipesRes.snapshotChanges().subscribe(res => {
      this.dataFetched = false;
      this.recipes = [];
      const rndRes = [];
      for (let i = 0; i < this.suggestionsNumber; i++){
        rndRes.push(res[Math.floor(Math.random() * res.length)]); // push a random element
      }
      rndRes.forEach(item => {
        const myRecipeItem = item.payload.toJSON();
        // @ts-ignore
        myRecipeItem.$key = item.key;
        // get title image
        this.pathReference = firebase.storage().ref().child(item.key + '/' + item.key + '_0.jpg').getDownloadURL().then(url => {
          this.imgs = url;
          // @ts-ignore
          myRecipeItem.title_image = this.imgs;
        });
        this.recipes.push(myRecipeItem as RecipeItem);
      });
      this.dataFetched = true;
    });
  }

  openRecipe(recipeP: any){
    const navigationExtras: NavigationExtras = {
      state: {
        recipe: recipeP,
        lastPage: 'presentation'
      }
    };
    this.router.navigate(['view-recipe'], navigationExtras);

  }

}
