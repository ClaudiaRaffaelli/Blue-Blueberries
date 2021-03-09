import {RecipeItem} from "./recipeItem";
// TODO mettere anche l'immagine di copertina della collection come field
export class CollectionItem {
  name: string;
  recipeList: Array<RecipeItem>;
  recipeNumber: number;
  coverPhoto: any;
}


