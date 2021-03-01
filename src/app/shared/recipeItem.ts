export class RecipeItem {
  $key: string;
  id: string;
  name: string;
  recipeText: string;
  recipeTime: number;
  ingredientsForm: IngredientsDic;
}

export class IngredientsDic{
  ingredients: {[key: string]: boolean} = {
    Pepperoni: false,
    Sausage: false,
    Mushrooms: false,
    Egg: false,
    Milk: false,
    Potato: false,
    Tomatoe: false,
    Rice: false,
  };
}

