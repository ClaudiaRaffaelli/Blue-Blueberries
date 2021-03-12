import { Component, OnInit, NgZone} from '@angular/core';
import {IngredientsDic} from '../shared/recipeItem';
import {NavigationExtras, Router} from '@angular/router';
import {Platform} from '@ionic/angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';


// import { Plugins } from '@capacitor/core';
// const { SpeechRecognition } = Plugins;


@Component({
  selector: 'app-search-recipe',
  templateUrl: './search-recipe.page.html',
  styleUrls: ['./search-recipe.page.scss'],
})
export class SearchRecipePage implements OnInit {

  queryRecipeName: string;
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
  searchDifficulty: boolean;
  difficulty: string;
  searchRequiredTime: boolean;
  maxRequiredTime: number;
  speechToText = '';
  pippo = '';
  micky = '';
  speechOptions = {
    language: 'en-US',
    matches: 1,
    prompt: 'say it',      // Android only
    showPopup: true,  // Android only
    showPartial: false
  };


  constructor(private router: Router, public platform: Platform, private speechRecognition: SpeechRecognition, public ngZone: NgZone) {
    this.queryRecipeName = '';
    this.difficulty = 'easy';
    this.showAvailableSearchBarResults = false;
    this.showUndesiredSearchBarResults = false;
    this.ing = new IngredientsDic();
    this.ingUndesired = new IngredientsDic();
    this.availableIngredientsKeys = Object.keys(this.ing.ingredients);
    this.undesiredIngredientsKeys = Object.keys(this.ingUndesired.ingredients);
    this.searchAvailableIngredients = false;
    this.searchUndesiredIngredients = false;
    this.searchDifficulty = false;
    this.searchRequiredTime = false;
    this.maxRequiredTime = 120;


    // Check feature available
    this.speechRecognition.isRecognitionAvailable()
        .then((available: boolean) => {
          if (available){
            this.speechRecognition.hasPermission()
                .then((hasPermission: boolean) => {
                  if (!hasPermission){
                    // Request permissions
                    this.speechRecognition.requestPermission();
                  }
                });
          }
        });


  }

  speak() {
    this.speechRecognition.startListening(this.speechOptions)
        .subscribe(
            (matches: string[]) => {
              this.ngZone.run(() => {
                this.pippo = '';
                this.micky = '';
                this.speechToText = matches[0];
                const ingredients = Object.keys(this.ing.ingredients);
                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < ingredients.length; i++) {
                  this.micky += ingredients[i] + ' ';
                  if (matches[0].toLowerCase().includes(ingredients[i].toLowerCase())){
                    this.pippo += ingredients[i];
                    this.toggleAvailableIngredient(ingredients[i]);
                  }
                }
                this.stop();
              });
            }
        );
  }

  stop(){
    // Stop the recognition process (iOS only)
    this.speechRecognition.stopListening();
  }

  ngOnInit() {
    // SpeechRecognition.hasPermission().then( (val) => {
    //   if (val.permission === false){
    //     SpeechRecognition.requestPermission();
    //   }
    // });

  }

  // speak(){
  //   SpeechRecognition.start({
  //     language: 'en-US',
  //     maxResults: 2,
  //     prompt: 'Say your available ingredients',
  //     partialResults: true,
  //     popup: true
  //   }).then( (results) => {
  //     const speechResult = document.getElementById('speechResults');
  //     speechResult.textContent = results;
  //   });
  // }
  //
  // stop(){
  //   SpeechRecognition.stop();
  // }


  onChangeName(event){
    this.queryRecipeName = event.target.value;
  }


  // search bar for available ingredients
  _ionChangeAvailable(event){
    const val = event.target.value; // get the value in the search bar
    if (val.trim() !== ''){ // If the user has typed something
      this.showAvailableSearchBarResults = true;
    }else {
      this.showAvailableSearchBarResults = false;
    }

    this.availableIngredients = this.ing.ingredients;

    if (val && val.trim() !== ''){ // show only the ingredients that satisfies the query
      this.availableIngredients = Object.keys(this.availableIngredients).filter((item: any) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    }
  }

  // search bar for undesired ingredients
  _ionChangeUndesired(event){
    const val = event.target.value; // get the value in the search bar
    if (val.trim() !== ''){ // If the user has typed something
      this.showUndesiredSearchBarResults = true;
    }else {
      this.showUndesiredSearchBarResults = false;
    }

    this.undesiredIngredients = this.ingUndesired.ingredients;

    if (val && val.trim() !== ''){ // show only the ingredients that satisfies the query
      this.undesiredIngredients = Object.keys(this.undesiredIngredients).filter((item: any) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    }
  }

  // check / uncheck available ingredients when clicked by user
  toggleAvailableIngredient(ingredient: unknown){
    // Change ingredient's state
    // @ts-ignore
    this.ing.ingredients[ingredient].selected = !this.ing.ingredients[ingredient].selected;
  }

  // check / uncheck undesired ingredients when clicked by user
  toggleUndesiredIngredient(ingredient: unknown){
    // Change ingredient's state
    // @ts-ignore
    this.ingUndesired.ingredients[ingredient].selected = !this.ingUndesired.ingredients[ingredient].selected;
  }

  // show search results only when these variables are tue
  toggleSearchAvailableIngredients(){
    this.searchAvailableIngredients = !this.searchAvailableIngredients;
    this.showAvailableIngredients = !this.showAvailableIngredients;
  }

  toggleSearchUndesiredIngredients(){
    this.searchUndesiredIngredients = !this.searchUndesiredIngredients;
    this.showUndesiredIngredients = !this.showUndesiredIngredients;
  }

  // show difficulty settings when searchDifficulty is true
  toggleSearchDifficulty(){
    this.searchDifficulty = !this.searchDifficulty;
  }
  // set difficulty (easy, medium or hard)
  toggleDifficulty(event){
    this.difficulty = event.target.value;
  }

  // show required time option
  toggleRequiredTime(){
    this.searchRequiredTime = !this.searchRequiredTime;
  }

  // save the max time required
  timeRequiredChange(event){
    const hoursInMinutes = parseInt(String(event.target.value.split(':')[0] * 60) , 10);
    const minutes = parseInt(event.target.value.split(':')[1], 10);
    this.maxRequiredTime = hoursInMinutes + minutes;
  }



  // submit button. Send the query to the next page
  submit(){
    const query: {[queryRequest: string]: {}} = {};
    if (this.queryRecipeName !== ''){
      query.recipeName = this.queryRecipeName;
    }
    if (this.searchAvailableIngredients){
      query.availableIngredients = this.ing.ingredients;
    }
    if (this.showUndesiredIngredients){
      query.undesiredIngredients = this.ingUndesired.ingredients;
    }
    if (this.searchDifficulty){
      query.difficulty = this.difficulty;
    }
    if (this.searchRequiredTime){
      query.requiredTime = this.maxRequiredTime;
    }

    const navigationExtras: NavigationExtras = {
      state: {
        query
      }
    };
    this.router.navigate(['home'], navigationExtras);
  }

}


