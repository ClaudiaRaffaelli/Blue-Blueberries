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

  // Options for images slider
  option = {
    slidesPerView: 1.5,
    centeredSlides: true,
    loop: false,
    spaceBetween: 2,
  };

  constructor(
      private aptService: RecipeItemService,
      private route: ActivatedRoute,
      private router: Router) {
  }


  ngOnInit() {
    this.recipesRes = this.aptService.getRecipesList();
    this.recipesRes.snapshotChanges().subscribe(res => {
      this.recipes = [];
      const rndRes = [];
      const suggestionsNumber = 3;
      for (let i = 0; i < suggestionsNumber; i++){
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
      })
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

}
