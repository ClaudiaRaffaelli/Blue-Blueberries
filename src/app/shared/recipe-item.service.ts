import { Injectable } from '@angular/core';
import { RecipeItem } from '../shared/recipeItem';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})

export class RecipeItemService {
  savedRecipesListRef: AngularFireList<any>;
  savedRecipesRef: AngularFireObject<any>;

  constructor(private db: AngularFireDatabase) { }

  // Create
  createRecipeItem(apt: RecipeItem) {
    return this.savedRecipesListRef.set(apt.$key, {
      name: apt.name,
      recipeText: apt.recipeText,
      recipeTime: apt.recipeTime
    });
  }

  // Get Single
  getRecipe(id: string) {
    this.savedRecipesRef = this.db.object('/recipes/' + id);
    return this.savedRecipesRef;
  }

  // Get List
  getRecipesList() {
    this.savedRecipesListRef = this.db.list('/recipes');
    return this.savedRecipesListRef;
  }

  // Update
  updateRecipe(id, apt: RecipeItem) {
    return this.savedRecipesRef.update({
      name: apt.name,
      recipeText: apt.recipeText,
      recipeTime: apt.recipeTime
    });
  }

  // Delete
  deleteRecipe(id: string) {
    this.savedRecipesRef = this.db.object('/recipes/' + id);
    this.savedRecipesRef.remove();
  }
}
