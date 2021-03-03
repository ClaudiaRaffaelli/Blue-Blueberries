// How my recipes are going to be stored in the database
export class RecipeItem {
  $key: string;
  name: string;
  recipeText: string;
  recipeTime: number;
  ingredientsForm: IngredientsDic;
}

export class IngredientsDic{
  ingredients: {[key: string]: {selected: boolean; dose: number; unit: string}} = {
    Mushrooms: {selected: false, dose: 0, unit: 'grams'},
    Eggs: {selected: false, dose: 0, unit: ''},
    Milk: {selected: false, dose: 0, unit: 'liters'},
    Potatoes: {selected: false, dose: 0, unit: ''},
    Tomatoes: {selected: false, dose: 0, unit: ''},
    Rice: {selected: false, dose: 0, unit: 'grams'},
    Water: {selected: false, dose: 0, unit: 'liters'}
  };
}

