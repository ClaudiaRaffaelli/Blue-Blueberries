// How my recipes are going to be stored in the database
export class RecipeItem {
  $key: string;
  name: string;
  recipeText: string;
  recipeDifficulty: string;
  recipeTime: number;
  ingredientsForm: IngredientsDic;
  imgsCount: number;
  videoUrl: string;
  collections: string;
  allergies: string[];
  desiredFood: string[];
  undesiredFood: string[];
}

export class IngredientsDic{
  ingredients: {[key: string]: {selected: boolean; dose: number; unit: string}} = {
    Mushrooms: {selected: false, dose: 0, unit: 'grams'}, // the unit parameter is not required to be specified here
    Eggs: {selected: false, dose: 0, unit: ''},
    Milk: {selected: false, dose: 0, unit: 'liters'},
    Potatoes: {selected: false, dose: 0, unit: ''},
    Tomatoes: {selected: false, dose: 0, unit: ''},
    Rice: {selected: false, dose: 0, unit: 'grams'},
    Water: {selected: false, dose: 0, unit: 'liters'},
    Pasta: {selected: false, dose: 0, unit: 'grams'},
    Garlic: {selected: false, dose: 0, unit: 'clove'},
    Basil: {selected: false, dose: 0, unit: 'as required'},
    Oil: {selected: false, dose: 0, unit: 'as required'},
    Salt: {selected: false, dose: 0, unit: 'as required'},
    Flour: {selected: false, dose: 0, unit: 'g'},
    Butter: {selected: false, dose: 0, unit: 'as required'},
    Sugar: {selected: false, dose: 0, unit: 'as required'},
    Apples: {selected: false, dose: 0, unit: ''},
    Figs: {selected: false, dose: 0, unit: 'g'},
    Limoncello: {selected: false, dose: 0, unit: 'tablespoons'},
    Raisins: {selected: false, dose: 0, unit: 'g'},
    PineNuts: {selected: false, dose: 0, unit: ''},
    Lemons: {selected: false, dose: 0, unit: ''},
    apricots: {selected: false, dose: 0, unit: ''},
    Oranges: {selected: false, dose: 0, unit: ''},
    Pistachios: {selected: false, dose: 0, unit: ''},
    Tahini: {selected: false, dose: 0, unit: ''},
    Chickpeas: {selected: false, dose: 0, unit: ''},
    White_potatoes: {selected: false, dose: 0, unit: ''},
    Dried_herbs: {selected: false, dose: 0, unit: ''},
    Golden_caster_sugar: {selected: false, dose: 0, unit: ''},
    Vanilla_Extract: {selected: false, dose: 0, unit: ''},
    Plain_flour: {selected: false, dose: 0, unit: ''},
    Strawberry_jam: {selected: false, dose: 0, unit: ''}
  };

  allergiesList = ['Crustaceans', 'Eggs', 'Dairy products', 'Peanuts', 'Soy', 'Wheat', 'Fish'];
  desiredFoodList = ['Vegetarian', 'Vegan', 'Kosher', 'Celiac', 'Lactose free', 'Gluten free'];
}

