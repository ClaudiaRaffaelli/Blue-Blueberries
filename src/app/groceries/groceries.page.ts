import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationExtras, Router} from "@angular/router";
import {Storage} from "@ionic/storage";
import firebase from "firebase";
import {RecipeItem} from "../shared/recipeItem";
import {GroceriesService} from "../shared/groceries.service";

@Component({
  selector: 'app-groceries',
  templateUrl: './groceries.page.html',
  styleUrls: ['./groceries.page.scss'],
})
export class GroceriesPage implements OnInit {

  lastPage = '';
  recipesInGroceryList = []; // contains the list of fetched recipeItems that are present in the grocery list
  pathReference : any;

  // Options for images slider
  option = {
    slidesPerView: 1.2,
    centeredSlides: true,
    loop: false,
    spaceBetween: 1,
  };

  constructor(private route: ActivatedRoute,
              private router: Router,
              private storage: Storage,
              private groceriesService: GroceriesService) {
    // making sure that local storage is ready
    storage.ready().then(() => {
    });

    this.route.queryParams.subscribe(async params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.lastPage = this.router.getCurrentNavigation().extras.state.lastPage;
      }
    });
  }

  ngOnInit() {
  }

  async ionViewWillEnter(){
    // each time I enter the page the recipes shown in the grocery list needs to be updated
    this.recipesInGroceryList = []
    // getting the list of keys of recipeItems from withing the Grocery List array in ionic storage
    await this.groceriesService.getGroceryList().then( async groceryList => {
      // getting the recipeItems from the list of keys
      const database = firebase.database().ref();
      for (const recipeKey of groceryList){

        const myRecipeItem = await database.child('recipes').child(recipeKey).get().then(function(snapshot) {
          if (snapshot.exists()) {
            // tslint:disable-next-line:no-shadowed-variable
            const myRecipeItem = snapshot.val();
            // @ts-ignore
            myRecipeItem.$key = recipeKey;
            return myRecipeItem;
          }
          else {
            console.log('No data available');
          }
        }).catch(function(error) {
          console.error(error);
        });

        // get title image
        this.pathReference = firebase.storage().ref().child(recipeKey + '/' + recipeKey + '_0.jpg').getDownloadURL().then(url => {
          myRecipeItem.title_image = url;
        });
        this.recipesInGroceryList.push(myRecipeItem as RecipeItem);
      }
    });

  }

  openRecipe(recipeP: any){
    const navigationExtras: NavigationExtras = {
      state: {
        recipe: recipeP,
        lastPage: 'groceries'
      }
    };
    this.router.navigate(['view-recipe'], navigationExtras);
  }
}
