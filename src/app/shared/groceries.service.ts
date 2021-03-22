import { Injectable } from '@angular/core';
import {Storage} from "@ionic/storage";
import {requiresInlineTypeCheckBlock} from "@angular/compiler-cli/src/ngtsc/typecheck/src/tcb_util";

@Injectable({
  providedIn: 'root'
})
export class GroceriesService {

  constructor( private storage: Storage) { }


  getGroceryList(){
    // getting the array of recipe key in the grocery list
    return this.storage.get("GroceryList").then((item) => {
      // If this is the first time we are fetching the grocery there is also no grocery list and we create it
      if (item == undefined){
        this.storage.set("GroceryList", JSON.stringify([]));
      }
      return JSON.parse(item);
    });
  }


  async addRemoveRecipeFromGrocery(recipeKey){
    // updating the list of collections
    await this.storage.get("GroceryList").then(async valueStr => {
      let value = valueStr ? JSON.parse(valueStr) : {};

      // pushing the recipe key if not already present in the grocery list
      if (! value.includes(recipeKey)) {
        value.push(recipeKey);
      }else{
        // if the key is already present we remove it from the list
        value = value.filter(v => v !== recipeKey);
      }
      // Save the entire data again
      await this.storage.set("GroceryList", JSON.stringify(value));
    });
  }


}
