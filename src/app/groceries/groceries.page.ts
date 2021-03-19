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
  ingredients = [];
  recipesCheck = []; // contains a boolean for each recipe that tells if the recipe is currently checked or not

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
    this.recipesCheck = []
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
        this.recipesCheck.push(true); // as default a new recipe added is checked

      }
      this.menageIngredientsList()
    });
  }

  menageIngredientsList(){
    this.ingredients = [];

    // putting together all the ingredients and summing the shared ingredients
    this.recipesInGroceryList.forEach((recipe, index) =>{
      // if the recipe is checked we show the ingredients related to it
      if(this.recipesCheck[index] === true){
        // going through all the ingredients
        for (let ingredient in recipe.ingredients) {
          // going through all the ingredients that are present in the recipe
          if (recipe.ingredients[ingredient]["selected"] === true){
            // we add to the ingredient list displayed this ingredient if the item is not already present
            if (! this.ingredients.map(a=>a.name).includes(ingredient)){
              let newIngredient = new Ingredient();
              newIngredient.name = ingredient;
              newIngredient.quantity = recipe.ingredients[ingredient]["dose"];
              newIngredient.unity = recipe.ingredients[ingredient]["unit"];
              this.ingredients.push(newIngredient);
            }else{
              // if already present, we only increment the quantity summing the new
              // todo to be more precise we would have to consider different unity of the same ingredient,
              //  but we assume that the unity is the same
              let myIngredient = this.ingredients.find(a=>a.name === ingredient);
              myIngredient.quantity = parseInt(myIngredient.quantity) + parseInt(recipe.ingredients[ingredient]["dose"]);
            }
          }
        }
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

  checkUncheckRecipe(recipeIndex){
    this.recipesCheck[recipeIndex] = !this.recipesCheck[recipeIndex];
    this.menageIngredientsList()
  }

  checkUncheckIngredient(event){

    if( ! event.target.checked ){
      event.target.parentNode.style.textDecoration = "line-through";
      event.target.parentNode.style.opacity = 0.5;

      const parent = event.target.parentElement.parentElement;
      parent.appendChild(event.target.parentElement);

    }else{
      event.target.parentNode.style.textDecoration = "none";
      event.target.parentNode.style.opacity = 1;

      const parent = event.target.parentElement.parentElement;
      parent.insertBefore(event.target.parentElement, parent.firstChild);

    }
  }
}


export class Ingredient{
  name : string;
  quantity : number;
  unity: string;
}
