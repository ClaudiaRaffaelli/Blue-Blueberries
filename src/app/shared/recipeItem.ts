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
    Cherry_tomatoes: {selected: false, dose: 0, unit: ''},
    Rice: {selected: false, dose: 0, unit: 'grams'},
    Water: {selected: false, dose: 0, unit: 'liters'},
    Pasta: {selected: false, dose: 0, unit: 'grams'},
    Garlic: {selected: false, dose: 0, unit: 'cloves'},
    Basil: {selected: false, dose: 0, unit: 'as required'},
    Oil: {selected: false, dose: 0, unit: 'as required'},
    Salt: {selected: false, dose: 0, unit: 'as required'},
    Flour: {selected: false, dose: 0, unit: 'g'},
    Butter: {selected: false, dose: 0, unit: 'as required'},
    Sugar: {selected: false, dose: 0, unit: 'as required'},
    Apples: {selected: false, dose: 0, unit: ''},
    Figs: {selected: false, dose: 0, unit: 'g'},
    Limoncello: {selected: false, dose: 0, unit: 'tsp'},
    Raisins: {selected: false, dose: 0, unit: 'g'},
    Lemons: {selected: false, dose: 0, unit: ''},
    Oranges: {selected: false, dose: 0, unit: ''},
    Pistachios: {selected: false, dose: 0, unit: ''},
    Tahini: {selected: false, dose: 0, unit: ''},
    Chickpeas: {selected: false, dose: 0, unit: ''},
    White_potatoes: {selected: false, dose: 0, unit: ''},
    Dried_herbs: {selected: false, dose: 0, unit: ''},
    Golden_caster_sugar: {selected: false, dose: 0, unit: 'g'},
    Vanilla_Extract: {selected: false, dose: 0, unit: 'tsp'},
    Plain_flour: {selected: false, dose: 0, unit: ''},
    Strawberry_jam: {selected: false, dose: 0, unit: ''},
    Onion: {selected: false, dose: 0, unit: ''},
    Vegetable_stock: {selected: false, dose: 0, unit: ''},
    Tinned_tomato: {selected: false, dose: 0, unit: 'tins'},
    Balsamic_vinegar: {selected: false, dose: 0, unit: ''},
    Pepper: {selected: false, dose: 0, unit: 'as required'},
    Avocado: {selected: false, dose: 0, unit: ''},
    Lime: {selected: false, dose: 0, unit: ''},
    Coriander: {selected: false, dose: 0, unit: ''},
    Olive_oil: {selected: false, dose: 0, unit: 'tbsp'},
    Carrot: {selected: false, dose: 0, unit: ''},
    Red_wine: {selected: false, dose: 0, unit: 'ml'},
    Mushroom_stock: {selected: false, dose: 0, unit: 'ml'},
    Rosemary: {selected: false, dose: 0, unit: 'tsp'},
    Bay_leaves: {selected: false, dose: 0, unit: ''},
    Tomato_puree: {selected: false, dose: 0, unit: 'tbsp'},
    Frozen_peas: {selected: false, dose: 0, unit: 'g'},
    Soy_mince: {selected: false, dose: 0, unit: 'g'},
    Digestive_biscuits: {selected: false, dose: 0, unit: 'g'},
    Unsalted_butter: {selected: false, dose: 0, unit: 'g'},
    Cadburys_mini_eggs_chopped: {selected: false, dose: 0, unit: 'g'},
    Cadburys_mini_eggs: {selected: false, dose: 0, unit: ''},
    Double_cream: {selected: false, dose: 0, unit: 'ml'},
    Icing_sugar: {selected: false, dose: 0, unit: 'g'},
    Philadelphia: {selected: false, dose: 0, unit: 'g'},
    Meringue_nests: {selected: false, dose: 0, unit: 'g'},
    Spaghetti: {selected: false, dose: 0, unit: 'g'},
    Bicarbonate_of_soda: {selected: false, dose: 0, unit: 'tsp'},
    Ground_cumin: {selected: false, dose: 0, unit: 'tsp'},
    Paprika: {selected: false, dose: 0, unit: 'tsp'},
    Parsley_leaf: {selected: false, dose: 0, unit: ''},
    Nutella: {selected: false, dose: 0, unit: 'g'},
    Halloumi_cheese: {selected: false, dose: 0, unit: 'g'},
    Sunflower_oil: {selected: false, dose: 0, unit: 'g'},
    Baguette: {selected: false, dose: 0, unit: ''},
    Balsami_glaze: {selected: false, dose: 0, unit: 'optional'},
    Naan_breads: {selected: false, dose: 0, unit: ''},
    Mozzarella: {selected: false, dose: 0, unit: 'slices'},
    Rocket: {selected: false, dose: 0, unit: ''},
    Lotus_Biscoff_Biscuits: {selected: false, dose: 0, unit: ''},
    Biscoff_spread: {selected: false, dose: 0, unit: ''},
    Chilli_flakes: {selected: false, dose: 0, unit: 'tsp'},
    Cheddar_cheese: {selected: false, dose: 0, unit: 'g'},
    Baking_powder: {selected: false, dose: 0, unit: 'tsp'},
    Brioche_buns: {selected: false, dose: 0, unit: ''},
  };

  allergiesList = ['Crustaceans', 'Eggs', 'Dairy products', 'Peanuts', 'Soy', 'Wheat', 'Fish'];
  desiredFoodList = ['Vegetarian', 'Vegan', 'Kosher', 'Lactose free', 'Gluten free'];
}

