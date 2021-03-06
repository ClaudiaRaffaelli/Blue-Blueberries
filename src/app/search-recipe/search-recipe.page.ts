import { Component, OnInit } from '@angular/core';
import {IngredientsDic} from '../shared/recipeItem';

@Component({
  selector: 'app-search-recipe',
  templateUrl: './search-recipe.page.html',
  styleUrls: ['./search-recipe.page.scss'],
})
export class SearchRecipePage implements OnInit {

  showAvailableSearchBarResults: boolean;
  showAvailableIngredients: boolean;
  showUndesiredSearchBarResults: boolean;
  showUndesiredIngredients: boolean;
  ing: IngredientsDic;
  ingUndesired: IngredientsDic;
  availableIngredientsKeys: {};
  undesiredIngredientsKeys: {};
  availableIngredients: {};
  undesiredIngredients: {};
  searchAvailableIngredients: boolean;
  searchUndesiredIngredients: boolean;
  difficulty: string;
  searchDifficulty: boolean;

  constructor() {
    this.difficulty = '';
    this.showAvailableSearchBarResults = false;
    this.showUndesiredSearchBarResults = false;
    this.ing = new IngredientsDic();
    this.ingUndesired = new IngredientsDic();
    this.availableIngredientsKeys = Object.keys(this.ing.ingredients);
    this.undesiredIngredientsKeys = Object.keys(this.ingUndesired.ingredients);
    this.searchAvailableIngredients = false;
    this.searchUndesiredIngredients = false;
    this.searchDifficulty = false;
  }

  ngOnInit() {
  }


  // search bar
  _ionChangeAvailable(event){
    const val = event.target.value;
    if (val.trim() !== ''){
      this.showAvailableSearchBarResults = true;
    }else {
      this.showAvailableSearchBarResults = false;
    }

    this.availableIngredients = this.ing.ingredients;

    if (val && val.trim() !== ''){
      this.availableIngredients = Object.keys(this.availableIngredients).filter((item: any) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    }
  }

  // search bar
  _ionChangeUndesired(event){
    const val = event.target.value;
    if (val.trim() !== ''){
      this.showUndesiredSearchBarResults = true;
    }else {
      this.showUndesiredSearchBarResults = false;
    }

    this.undesiredIngredients = this.ingUndesired.ingredients;

    if (val && val.trim() !== ''){
      this.undesiredIngredients = Object.keys(this.undesiredIngredients).filter((item: any) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    }
  }

  toggleAvailableIngredient(ingredient: unknown){
    // Change ingredient's state
    // @ts-ignore
    this.ing.ingredients[ingredient].selected = !this.ing.ingredients[ingredient].selected;
  }

  toggleUndesiredIngredient(ingredient: unknown){
    // Change ingredient's state
    // @ts-ignore
    this.ingUndesired.ingredients[ingredient].selected = !this.ingUndesired.ingredients[ingredient].selected;
  }

  toggleSearchAvailableIngredients(){
    this.searchAvailableIngredients = !this.searchAvailableIngredients;
    this.showAvailableIngredients = !this.showAvailableIngredients;
  }

  toggleSearchUndesiredIngredients(){
    this.searchUndesiredIngredients = !this.searchUndesiredIngredients;
    this.showUndesiredIngredients = !this.showUndesiredIngredients;
  }


  toggleSearchDifficulty(){
    this.searchDifficulty = !this.searchDifficulty;
  }

  toggleDifficulty(event){
    this.difficulty = event.target.value;
  }

}


