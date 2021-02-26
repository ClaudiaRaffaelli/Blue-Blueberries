export class RecipeItem {
  $key: string;
  id: string;
  name: string;
  recipeText: string;
  recipeTime: number;
  ingredientsForm: IngredientsDic;
}

export class IngredientsDic{
  private color = 'dark';
  ingredients = [
    { name: 'Pepperoni', isChecked: false, color: this.color },
    { name: 'Sausage', isChecked: false, color: this.color },
    { name: 'Mushroom', isChecked: false, color: this.color },
    { name: 'Egg', isChecked: false, color: this.color },
    { name: 'Milk', isChecked: false, color: this.color },
    { name: 'Rice', isChecked: false, color: this.color },
    { name: 'Potatoes', isChecked: false, color: this.color },
    { name: 'Cauliflower', isChecked: false, color: this.color },
  ];
}

