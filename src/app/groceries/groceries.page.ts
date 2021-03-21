import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, NavigationExtras, Router} from "@angular/router";
import {Storage} from "@ionic/storage";
import firebase from "firebase";
import {RecipeItem} from "../shared/recipeItem";
import {GroceriesService} from "../shared/groceries.service";
import * as _ from 'lodash';

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

  async ngOnInit() {

    // getting the list of keys of recipeItems from within the Grocery List array in ionic storage
    await this.groceriesService.getGroceryList().then( async groceryList => {
      this.thisTimeGroceryKeyRecipes = groceryList;

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

      // getting the recipeItems from the list of keys
      const database = firebase.database().ref();

      // getting only the recipeItems for the added recipes
      let recipeKeyIndex = 0;
      for( let recipeKey of newAdded){
        const recipe = await database.child('recipes').child(recipeKey).get().then(function (snapshot) {
          if (snapshot.exists()) {
            const recipe = snapshot.val();
            recipe.$key = recipeKey;
            return recipe;
          } else {
            console.log('No data available');
          }
        }).catch(function (error) {
          console.error(error);
        });

        // get title image
        this.pathReference = firebase.storage().ref().child(recipeKey + '/' + recipeKey + '_0.jpg').getDownloadURL().then(url => {
          recipe.title_image = url;
        });

        this.recipesInGroceryList.push(recipe as RecipeItem);
        this.recipesCheck.push(true); // as default a new recipe added is checked

        // add the ingredients to the list of ingredients going through all of them
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
              // if already present, we only increment the quantity summing the new (assuming we are using the same unity)
              let myIngredient = this.ingredients.find(a=>a.name === ingredient);
              myIngredient.quantity = parseInt(myIngredient.quantity) + parseInt(recipe.ingredients[ingredient]["dose"]);
              myIngredient.checked = false;
            }
          }
        }
        recipeKeyIndex ++;
      }


      // deleting the recipeItems and ingredients of the removed recipe wrt the last time we entered the page
      for (let recipeKey of this.lastTimeGroceryKeyRecipes){
        // if recipeKey has been deleted we fetch the recipeItem, remove the ingredients and the check from the array
        if (!this.thisTimeGroceryKeyRecipes.includes(recipeKey)){
          let toRemoveRecipeIndex = this.lastTimeGroceryKeyRecipes.indexOf(recipeKey)

          const recipe = await database.child('recipes').child(recipeKey).get().then(function (snapshot) {
            if (snapshot.exists()) {
              const recipe = snapshot.val();
              recipe.$key = recipeKey;
              return recipe;
            } else {
              console.log('No data available');
            }
          }).catch(function (error) {
            console.error(error);
          });


          // remove the ingredients from the list of ingredients going through all of them, but only if the
          // the recipe is currently checked. Otherwise it means that the recipe's ingredients have already been removed
          if (this.recipesCheck[toRemoveRecipeIndex] === true){
            let ingredientIndex = 0;
            for (let ingredient in recipe.ingredients) {
              // going through all the ingredients that are present in the recipe
              if (recipe.ingredients[ingredient]["selected"] === true){

                // the ingredient is surely in the list of ingredients and we must decrement the dose
                let myIngredient = this.ingredients.find(a=>a.name === ingredient);
                myIngredient.quantity = parseInt(myIngredient.quantity) - parseInt(recipe.ingredients[ingredient]["dose"]);
              }
              ingredientIndex++;
            }
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
      // if the new quantity is zero we must remove this ingredient from the list
      this.ingredients= await this.ingredients.filter(function (el) {
        return el.quantity != 0;
      });
      // removing the recipes from the grocery list that were set to undefined because not present anymore
      this.recipesInGroceryList= await this.recipesInGroceryList.filter(function (el) {
        return el != undefined;
      });
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
              // if already present, we only increment the quantity summing the new (assuming we are using the same unity)
              let myIngredient = this.ingredients.find(a=>a.name === ingredient);
              myIngredient.quantity = parseInt(myIngredient.quantity) + parseInt(recipe.ingredients[ingredient]["dose"]);
            }
          }
        }
      }
    });
  }

  async hideDeleteIngredientsForRecipe(recipeIndex){
    // takes as input the index of the recipe in recipesInGroceryList and add / subtracts the relative ingredients

    if(this.recipesCheck[recipeIndex] === true){
      // going through all the ingredients
      for (let ingredient in this.recipesInGroceryList[recipeIndex].ingredients) {
        // going through all the ingredients that are present in the recipe
        if (this.recipesInGroceryList[recipeIndex].ingredients[ingredient]["selected"] === true){
          // we add to the ingredient list displayed this ingredient if the item is not already present
          if (! this.ingredients.map(a=>a.name).includes(ingredient)){
            let newIngredient = new Ingredient();
            newIngredient.name = ingredient;
            newIngredient.quantity = this.recipesInGroceryList[recipeIndex].ingredients[ingredient]["dose"];
            newIngredient.unity = this.recipesInGroceryList[recipeIndex].ingredients[ingredient]["unit"];
            this.ingredients.push(newIngredient);
          }else{
            // if already present, we only increment the quantity summing the new (assuming we are using the same unity)
            let myIngredient = this.ingredients.find(a=>a.name === ingredient);
            //let ingredientIndex = this.ingredients.indexOf(myIngredient)
            myIngredient.quantity = parseInt(myIngredient.quantity) + parseInt(this.recipesInGroceryList[recipeIndex].ingredients[ingredient]["dose"]);
            myIngredient.checked = false;
          }
        }
      }
    }else{
      // going through all the ingredients
      for (let ingredient in this.recipesInGroceryList[recipeIndex].ingredients) {
        // going through all the ingredients that are present in the recipe
        if (this.recipesInGroceryList[recipeIndex].ingredients[ingredient]["selected"] === true){
          // we add to the ingredient list displayed this ingredient if the item is not already present
          let myIngredient = this.ingredients.find(a=>a.name === ingredient);
          myIngredient.quantity = parseInt(myIngredient.quantity) - parseInt(this.recipesInGroceryList[recipeIndex].ingredients[ingredient]["dose"]) ;
        }
      }
    }
    // if the new quantity is zero we must remove this ingredient from the list
    this.ingredients= await this.ingredients.filter(function (el) {
      return el.quantity != 0;
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
    // keeping track of the check on each recipe
    this.recipesCheck[recipeIndex] = !this.recipesCheck[recipeIndex];
    this.hideDeleteIngredientsForRecipe(recipeIndex);
  }

  checkUncheckIngredient(event, ingredient){
    ingredient.checked = !event.target.checked;

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
  checked: boolean = false;
}