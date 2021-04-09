import { Component, OnInit } from '@angular/core';
import firebase from 'firebase';
import {RecipeItemService} from '../shared/recipe-item.service';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {IngredientsDic, RecipeItem} from '../shared/recipeItem';
import {Storage} from '@ionic/storage';
import {Platform} from '@ionic/angular';
import {PreferencesService} from "../shared/preferences.service";

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.page.html',
  styleUrls: ['./presentation.page.scss'],
})
export class PresentationPage implements OnInit {
  suggestedRecipes = [];
  pathReference: any;
  recipesRes: any;
  collectionsRes: any;
  imgs: []; // Title images downloaded from the firebase storage
  suggestionsNumber = 3; // suggested recipes
  currentSuggestions = 0;
  dataFetched: boolean; // flag that indicates when all recipes data have been downloaded from the database
  collections = [];
  picks = [];

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
      private router: Router,
      public storage: Storage,
      private platform: Platform,
      private preferencesDBService: PreferencesService) {
    this.currentSuggestions = 0;
  }


  async ngOnInit() {
    this.recipesRes = this.aptService.getRecipesList();
    this.recipesRes.snapshotChanges().subscribe(async res => {
      this.dataFetched = false;
      this.suggestedRecipes = [];
      this.picks = [];

      for (const item of res) {
        const myRecipeItem = item.payload.toJSON();
        // @ts-ignore
        myRecipeItem.$key = item.key;
        // get title image
        this.pathReference = firebase.storage().ref().child(item.key + '/' + item.key + '_0.jpg').getDownloadURL().then(url => {
          this.imgs = url;
          // @ts-ignore
          myRecipeItem.title_image = this.imgs;
        });
        await this.checkPreferences(myRecipeItem);
      }
      for (let i = 0; i < this.suggestionsNumber; i++) {
        const random = Math.floor(Math.random() * this.suggestedRecipes.length);
        this.picks.push(this.suggestedRecipes[random]); // push a random element
      }
    });

    // importing the collections
    this.collectionsRes = this.aptService.getCollectionsList();
    await this.collectionsRes.snapshotChanges().subscribe( col => {
      col.forEach( async collection => {

        const collectionItem = new FixedCollectionItem();
        collectionItem.name = collection.key;

        // taking from the first recipe in the collection the cover image for the collection itself
        const [firstRecipeKey] = Object.keys(collection.payload.toJSON());

        await firebase.storage().ref().child(firstRecipeKey + '/' + firstRecipeKey + '_0.jpg').getDownloadURL().then(async url => {
          collectionItem.coverImage = url;
        });

        collectionItem.recipeList = Object.keys(collection.payload.toJSON());

        collectionItem.numberOfRecipes = collectionItem.recipeList.length;
        this.collections.push(collectionItem);


      });
      this.dataFetched = true;

    });

  }

  ionViewDidLeave(){
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigate(['presentation']);
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

  openCollection(collectionP: any){

    const navigationExtras: NavigationExtras = {
      state: {
        collection: collectionP,
        lastPage: 'presentation'
      }
    };
    this.router.navigate(['home'], navigationExtras);
  }

  async checkPreferences(myRecipeItem) {
    const allergies: [] = await this.preferencesDBService.getAllergies();
    const undesiredFood: [] = await this.preferencesDBService.getUndesiredFood();
    const desiredFood: [] = await this.preferencesDBService.getDesiredFood();
    let numberOfFilters = 0;
    if (allergies.length > 0) { numberOfFilters++; }
    if (desiredFood.length > 0) { numberOfFilters++; }
    if (undesiredFood.length > 0) { numberOfFilters++; }
    if (numberOfFilters === 0){
      this.suggestedRecipes.push(myRecipeItem as RecipeItem);
      this.currentSuggestions++;
    }else{
      let filtersSatisfied = true;
      if (allergies.length > 0 && (filtersSatisfied === true)){
        let filterOk = true;
        for (const recipeAllergy in myRecipeItem.allergies){
          for (let i = 0; i < allergies.length; i++){
            // @ts-ignore
            if (allergies[i] === myRecipeItem.allergies[recipeAllergy]){
              filterOk = false;
              filtersSatisfied = false;
              break;
            }
          }
        }
        if (filterOk){
          if (--numberOfFilters === 0) {
            this.suggestedRecipes.push(myRecipeItem as RecipeItem);
            this.currentSuggestions++;
          }
        }else{
          filtersSatisfied = false;
        }
      }
      // @ts-ignore
      if (desiredFood.length > 0 && (filtersSatisfied === true)) {
        let filterOk = true;
        try{ // old recipes does not have user preferences
          for (let i = 0; i < desiredFood.length; i++) {
            let foundDesiredFood = false;
            for (const recipeDesiredFood in myRecipeItem.desiredFood) {
              if (desiredFood[i] === myRecipeItem.desiredFood[recipeDesiredFood]) {
                foundDesiredFood = true;
              }
            }
            if (!foundDesiredFood) {
              filterOk = false;
              break;
            }
          }
        }catch (e){}
        finally {
          if (filterOk){
            if (--numberOfFilters === 0) {
              this.suggestedRecipes.push(myRecipeItem as RecipeItem);
              this.currentSuggestions++;
            }
          }else{
            filtersSatisfied = false;
          }
        }
      }
      // @ts-ignore
      if (undesiredFood.length > 0 && (filtersSatisfied === true)) {
        let filterOk = true;
        try {
          for (let i = 0; i < undesiredFood.length; i++) {
            // @ts-ignore
            if (myRecipeItem.ingredients[undesiredFood[i]] !== undefined && myRecipeItem.ingredients[undesiredFood[i]].selected) {
              filterOk = false;
              filtersSatisfied = false;
              break;
            }
          }
        }catch (e){}
        if (filterOk){
          if (--numberOfFilters === 0) {
            this.suggestedRecipes.push(myRecipeItem as RecipeItem);
            this.currentSuggestions++;
          }
        }else{
          filtersSatisfied = false;
        }
      }
    }
  }

}

export class FixedCollectionItem {
  name: string;
  recipeList: any;
  numberOfRecipes: number;
  coverImage: any;
}
