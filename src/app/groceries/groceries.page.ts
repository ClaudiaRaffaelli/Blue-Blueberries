import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationExtras, Router} from "@angular/router";
import {Storage} from "@ionic/storage";
import firebase from "firebase";
import {RecipeItem} from "../shared/recipeItem";
import {GroceriesService} from "../shared/groceries.service";
import * as _ from 'lodash';
import {Platform} from "@ionic/angular";

@Component({
  selector: 'app-groceries',
  templateUrl: './groceries.page.html',
  styleUrls: ['./groceries.page.scss'],
})
export class GroceriesPage implements OnInit {

  lastPage = '';
  recipesInGroceryList = []; // contains the list of fetched recipeItems that are present in the grocery list
  oldRecipesInGroceryList = []; //list that contains the recipeItems that were in the list last time we entered the page
  lastTimeGroceryKeyRecipes = []; // keys of the recipes that were in the list last time we entered the page
  thisTimeGroceryKeyRecipes = [];
  pathReference : any;
  ingredients = [];
  recipesCheck = []; // contains a boolean for each recipe that tells if the recipe is currently checked or not
                     // at the beginning each recipe is checked
  database : any; // reference to the firebase

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
              private groceriesService: GroceriesService,
              public platform: Platform) {
    // making sure that local storage is ready
    storage.ready().then(() => {
    });

    this.route.queryParams.subscribe(async params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.lastPage = this.router.getCurrentNavigation().extras.state.lastPage;
      }
    });

    this.database = firebase.database().ref();
  }

  async ngOnInit() {

    // getting the list of keys of recipeItems from within the Grocery List array in ionic storage
    await this.groceriesService.getGroceryList().then( async groceryList => {
      this.thisTimeGroceryKeyRecipes = groceryList;

      // getting the recipeItems from the list of keys
      for (const recipeKey of groceryList){
        const myRecipeItem = await this.getRecipeItem(recipeKey);
        this.recipesInGroceryList.push(myRecipeItem as RecipeItem);
        this.recipesCheck.push(true); // as default a new recipe added is checked
      }

      this.ingredients = [];
      // putting together all the ingredients and summing the shared ingredients
      this.recipesInGroceryList.forEach((recipe, index) =>{
        // if the recipe is checked we show the ingredients related to it
        if(this.recipesCheck[index] === true){
          this.iterateIngredientsAndAdd(recipe);
        }
      });
    });
  }

  async ionViewWillEnter(){
    this.lastTimeGroceryKeyRecipes = this.thisTimeGroceryKeyRecipes;

    await this.groceriesService.getGroceryList().then( async groceryList => {

      if(groceryList.length == 0){
        this.recipesInGroceryList = []; // contains the list of fetched recipeItems that are present in the grocery list
        this.oldRecipesInGroceryList = []; //list that contains the recipeItems that were in the list last time we entered the page
        this.lastTimeGroceryKeyRecipes = []; // keys of the recipes that were in the list last time we entered the page
        this.thisTimeGroceryKeyRecipes = [];
        this.ingredients = [];
        this.recipesCheck = [];
        return;
      }

      // saving the names of the recipes currently in list: they will be useful next time we enter the page
      this.lastTimeGroceryKeyRecipes = this.thisTimeGroceryKeyRecipes;
      // we also copy the content of what was in the grocery list last time we entered the page
      this.oldRecipesInGroceryList = this.recipesInGroceryList

      // each time I enter the page the recipes shown in the grocery list needs to be updated
      this.thisTimeGroceryKeyRecipes = groceryList;

      // check if there are any differences between the recipe names before and after entering the page
      let newAdded = _.difference(this.thisTimeGroceryKeyRecipes, this.lastTimeGroceryKeyRecipes)

      // getting only the recipeItems for the added recipes
      for( let recipeKey of newAdded){
        const recipe = await this.getRecipeItem(recipeKey);
        this.recipesInGroceryList.push(recipe as RecipeItem);
        this.recipesCheck.push(true); // as default a new recipe added is checked
        // add the ingredients to the list of ingredients going through all of them
        this.iterateIngredientsAndAdd(recipe)

        for (let ingredient in recipe.ingredients) {
          // fetching the Ingredient items knowing their name
          if (recipe.ingredients[ingredient]["selected"] === true) {
            let myIngredient = this.ingredients.find(a => a.name === ingredient);
            await this.sortRecipesInIngredients([myIngredient])
          }
        }
      }

      // deleting the recipeItems and ingredients of the removed recipe wrt the last time we entered the page
      for (let recipeKey of this.lastTimeGroceryKeyRecipes){
        if (!this.thisTimeGroceryKeyRecipes.includes(recipeKey)){
          let toRemoveRecipeIndex = this.lastTimeGroceryKeyRecipes.indexOf(recipeKey)

          const recipe = await this.getRecipeItem(recipeKey, false)

          // remove the ingredients from the list of ingredients going through all of them, but only if the
          // the recipe is currently checked. Otherwise it means that the recipe's ingredients have already been removed
          if (this.recipesCheck[toRemoveRecipeIndex] === true){
            this.iterateIngredientsAndDelete(recipe)
          }
          // sets the recipeCheck to undefined. This allows to maintain the index after the delete.
          // we will filter out the undefined when all the deleted recipes have been removed
          delete this.recipesCheck[toRemoveRecipeIndex];
          // same for the recipesInGroceryList
          delete this.recipesInGroceryList[toRemoveRecipeIndex];
        }
      }

      // removing the checks that were set to undefined because the relative recipe has been deleted
      this.recipesCheck = await this.recipesCheck.filter(function (el) {
        return el != undefined;
      });
      // removing the recipes from the grocery list that were set to undefined because not present anymore
      this.recipesInGroceryList= await this.recipesInGroceryList.filter(function (el) {
        return el != undefined;
      });
    });
  }


  ionViewDidLeave(){
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigate(['groceries']);
    });
  }

  async getRecipeItem(recipeKey, imageRequired=true){
    const myRecipeItem = await this.database.child('recipes').child(recipeKey).get().then(function(snapshot) {
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
    // we are getting the item to delete, no image fetch is required now
    if(imageRequired === true){
      // get title image
      this.pathReference = firebase.storage().ref().child(recipeKey + '/' + recipeKey + '_0.jpg').getDownloadURL().then(url => {
        myRecipeItem.title_image = url;
      });
    }
    return myRecipeItem;
  }

  iterateIngredientsAndAdd(recipe){
    // add the ingredients to the list of ingredients going through all of them
    for (let ingredient in recipe.ingredients) {
      // going through all the ingredients that are present in the recipe
      if (recipe.ingredients[ingredient]["selected"] === true){
        // we add to the ingredient list displayed this ingredient if the item is not already present
        if (! this.ingredients.map(a=>a.name).includes(ingredient)){
          let newIngredient = new Ingredient();
          newIngredient.name = ingredient;
          let ingredientInRecipe = new IngredientInRecipe()
          if(recipe.ingredients[ingredient]["dose"] !== 0){
            ingredientInRecipe.quantity = recipe.ingredients[ingredient]["dose"];
          }else{
            ingredientInRecipe.quantity = "";
          }
          ingredientInRecipe.recipeName = recipe.name;
          ingredientInRecipe.unity = recipe.ingredients[ingredient]["unit"];
          newIngredient.recipeList.push(ingredientInRecipe);
          this.ingredients.push(newIngredient);
        }else{
          // if already present, we only increment the quantity summing the new (assuming we are using the same unity)
          let myIngredient = this.ingredients.find(a=>a.name === ingredient);
          let ingredientInRecipe = new IngredientInRecipe()
          if(recipe.ingredients[ingredient]["dose"] !== 0){
            ingredientInRecipe.quantity = recipe.ingredients[ingredient]["dose"];
          }else{
            ingredientInRecipe.quantity = "";
          }
          ingredientInRecipe.recipeName = recipe.name;
          ingredientInRecipe.unity = recipe.ingredients[ingredient]["unit"];
          myIngredient.recipeList.push(ingredientInRecipe);
          // changing the check to the ingredient
          myIngredient.checked = false;
        }
      }
    }
  }

  iterateIngredientsAndDelete(recipe){
    for (let ingredient in recipe.ingredients) {
      // going through all the ingredients that are present in the recipe
      if (recipe.ingredients[ingredient]["selected"] === true){
        // the ingredient is surely in the list of ingredients and we must delete the IngredientInRecipe with this recipe
        // name
        let myIngredient = this.ingredients.find(a=>a.name === ingredient);
        myIngredient.recipeList = myIngredient.recipeList.filter(function (el) {
          return el.recipeName != recipe.name;
        });
        // the ingredient has no more recipe that use that ingredient and we must delete it from the list of ingredient
        if (myIngredient.recipeList.length === 0){
          this.ingredients = this.ingredients.filter(function (el){
            return el.name !=myIngredient.name;
          });
        }
      }
    }
  }

  sortRecipesInIngredients(ingredients){
    // the unchecked ingredients needs to stay at the top and the checked at the bottom
    // if some recipe ingredients has changed its status from checked to unchecked we make sure that the position at
    // the top or bottom of the list is updated
    for (let ingredient of ingredients){
      let checked = [];
      let unchecked = [];
      for (let ingredientRecipe of ingredient.recipeList){
        if(ingredientRecipe.checked === false){
          unchecked.push(ingredientRecipe);
        }else{
          checked.push(ingredientRecipe);
        }
      }
      ingredient.recipeList = unchecked.concat(checked);
    }
  }

  async hideDeleteIngredientsForRecipe(recipeIndex){
    // takes as input the index of the recipe in recipesInGroceryList and add / subtracts the relative ingredients
    if(this.recipesCheck[recipeIndex] === true){
      // going through all the ingredients and add
      this.iterateIngredientsAndAdd(this.recipesInGroceryList[recipeIndex])

      for (let ingredient in this.recipesInGroceryList[recipeIndex].ingredients) {
        // fetching the Ingredient items knowing their name
        if (this.recipesInGroceryList[recipeIndex].ingredients[ingredient]["selected"] === true) {
          let myIngredient = this.ingredients.find(a => a.name === ingredient);
          await this.sortRecipesInIngredients([myIngredient])
        }
      }
    }else{
      // going through all the ingredients and subtracts
      this.iterateIngredientsAndDelete(this.recipesInGroceryList[recipeIndex])
    }
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

  async deleteRecipe(recipeKey: string){
    // remove from the cart the recipeKey
    await this.groceriesService.addRemoveRecipeFromGrocery(recipeKey);
    await this.ionViewWillEnter();
  }

  checkUncheckRecipe(recipeIndex){
    // keeping track of the check on each recipe
    this.recipesCheck[recipeIndex] = !this.recipesCheck[recipeIndex];
    this.hideDeleteIngredientsForRecipe(recipeIndex);
  }

  async checkUncheckIngredient(event, recipeIngredient, ingredient){
    recipeIngredient.checked = !event.target.checked;
    await this.sortRecipesInIngredients([ingredient]);
  }
}


export class Ingredient{
  name : string;
  recipeList= [];
}

export class IngredientInRecipe{
  recipeName: string;
  quantity: string;
  unity: string;
  checked: boolean = false;
}
