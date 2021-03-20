import {Component, NgZone, OnInit} from '@angular/core';
import {IngredientsDic} from '../shared/recipeItem';
import {NavigationExtras, Router} from '@angular/router';
import {Platform} from '@ionic/angular';
import {SpeechRecognition} from '@ionic-native/speech-recognition/ngx';
import levenshtein from 'fast-levenshtein';
import {Insomnia} from '@ionic-native/insomnia/ngx';
import {TextToSpeech} from '@ionic-native/text-to-speech/ngx';


// import { Plugins } from '@capacitor/core';
// const { SpeechRecognition } = Plugins;


declare const annyang: any;

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
  availableSTT = '';
  speechOptions = {
    language: 'en-US',
    matches: 1,
    prompt: '',      // Android only
    showPopup: true,  // Android only
    showPartial: false
  };
  speaking = false;
  // voice assistant parameters
  voiceActiveSectionDisabled = true;
  voiceActiveSectionError = false;
  voiceActiveSectionSuccess = false;
  voiceActiveSectionListening = false;
  voiceText: any;
  voiceTextUser: string;
  assistantButtonColor = 'primary';


  constructor(private router: Router, public platform: Platform, private speechRecognition: SpeechRecognition,
              public ngZone: NgZone, private insomnia: Insomnia, private tts: TextToSpeech) {
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
    this.maxRequiredTime = 30;
    this.insomnia.allowSleepAgain();

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

    this.voiceActiveSectionDisabled = true;
    this.voiceActiveSectionError = false;
    this.voiceActiveSectionSuccess = false;
    this.voiceText = undefined;
    this.voiceTextUser = '';
    if (annyang) {
      // const difficultyCommand = {
      //   'set difficulty': () => {
      //     this.ngZone.run( () => {this.toggleSearchDifficulty(); });
      //   }
      // };
      // const timerCommand = {
      //   'set timer': () => {
      //     this.ngZone.run( () => {this.toggleRequiredTime(); });
      //   }
      // };
      // annyang.addCommands(difficultyCommand);
      // annyang.addCommands(timerCommand);

      this.initializeVoiceRecognitionCallback();
    }
  }

  speakIngredients(type: string) {
    this.speechRecognition.startListening(this.speechOptions)
        .subscribe(
            (matches: string[]) => {
              // ngZone.run is required so that the script can go back to angularZone (when the user has finished using the speechToText)
              // in order to update the view (if necessary)
              this.ngZone.run(() => {
                const ingredients = Object.keys(this.ing.ingredients);
                // tslint:disable-next-line:prefer-for-of
                for (let i = 0; i < ingredients.length; i++) {
                  // matches[0] is the first guess of the speechToText plugin (max 5, but is fixed to 1 in speechOptions variable)
                  const words = matches[0].toLowerCase().split(' '); // get all the words
                  // tslint:disable-next-line:prefer-for-of
                  for (let j = 0; j < words.length; j++){
                    if (levenshtein.get(words[j], ingredients[i].toLowerCase()) <= 1){
                      if (type === 'available'){
                        this.ing.ingredients[ingredients[i]].selected = true;
                      }else if (type === 'undesired'){
                        this.ingUndesired.ingredients[ingredients[i]].selected = true;
                      }
                    }
                  }
                }
                this.stopSpeakingIngredients();
              });
            }
        );
  }

  stopSpeakingIngredients(){
    // Stop the recognition process (iOS only)
    this.speechRecognition.stopListening();
  }


  ngOnInit() {

  }


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
        query,
        lastPage: 'search-recipe'
      }
    };
    this.router.navigate(['home'], navigationExtras);
  }



  // text-to-speech
  stopSpeaking(){
    this.tts.speak('')
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log(reason));
  }


  speak(text: string) {
    this.assistantButtonColor = 'warning';
    annyang.abort();
    this.speaking = true;
    this.tts.speak({
      text,
      rate: 1, // voice speed
      locale: 'en-US'
    })
        .then(() => {
          this.startVoiceRecognition();
          this.speaking = false;
        })
        .catch((reason: any) => this.closeVoiceRecognition());
  }

  // ANNYANG
  initializeVoiceRecognitionCallback(): void {
    annyang.addCallback('error', (err) => {
      if (err.error === 'network'){
        this.voiceText = 'Internet is require';
        this.ngZone.run(() => this.closeVoiceRecognition());
        this.ngZone.run(() => this.voiceActiveSectionSuccess = true);
      } else if (this.voiceText === undefined) { // didn't catch that
        this.ngZone.run(() => {
          this.voiceActiveSectionError = true;
          this.closeVoiceRecognition();
          this.startVoiceRecognition();
        });
      }
    });
    annyang.addCallback('soundstart', (res) => {
      this.ngZone.run(() => this.voiceActiveSectionListening = true);
    });
    annyang.addCallback('end', () => {
      if (this.voiceText === undefined) {
        this.ngZone.run(() => this.voiceActiveSectionError = true);
      }
      this.ngZone.run( () => this.closeVoiceRecognition());
    });
    annyang.addCallback('result', (userSaid) => {
      this.ngZone.run(() => this.voiceActiveSectionError = false);
      // annyang.abort();
      this.ngZone.run(() => this.voiceText = userSaid[0]);
      this.ngZone.run(() => this.voiceTextUser = userSaid[0]);
      this.ngZone.run(() => this.performIntent());
      this.ngZone.run(() => this.voiceActiveSectionListening = false);
      this.ngZone.run(() => this.voiceActiveSectionSuccess = true);
    });
  }

  startVoiceRecognition(): void {
    if (annyang) {
      this.voiceActiveSectionDisabled = false;
      annyang.start({ autoRestart: false });
      this.assistantButtonColor = 'danger';
    }
  }

  closeVoiceRecognition(): void {
    this.voiceActiveSectionDisabled = true;
    this.voiceActiveSectionError = false;
    this.voiceActiveSectionSuccess = false;
    this.voiceActiveSectionListening = false;
    if (annyang){
      annyang.abort();
    }
  }

  performIntent(){
    if (this.voiceText.toLowerCase().includes('i have')){
      const ingredients = Object.keys(this.ing.ingredients);
      for (let i = 0; i < ingredients.length; i++) {
        const queryIngredients = this.voiceText.toLowerCase().split('i have')[1].split(' ');
        for (let j = 0; j < queryIngredients.length; j++) {
          if (levenshtein.get(queryIngredients[j], ingredients[i].toLowerCase()) <= 1) {
            this.ing.ingredients[ingredients[i]].selected = true;
          }
        }
      }
      this.voiceText = 'We should find something with these';
      this.speak(this.voiceText);
    }
    else if (this.voiceText.toLowerCase().includes('i don\'t want')){
      const ingredients = Object.keys(this.ingUndesired.ingredients);
      for (let i = 0; i < ingredients.length; i++) {
        const queryIngredients = this.voiceText.toLowerCase().split('i don\'t want')[1].split(' ');
        for (let j = 0; j < queryIngredients.length; j++) {
          if (levenshtein.get(queryIngredients[j], ingredients[i].toLowerCase()) <= 1) {
            this.ingUndesired.ingredients[ingredients[i]].selected = true;
          }
        }
      }
      this.voiceText = 'Undesired ingredients set';
      this.speak(this.voiceText);
    }else if (this.voiceText.toLowerCase().includes('difficulty')){
      if (this.voiceText.toLowerCase().includes('easy')){
        this.difficulty = 'easy';
        this.voiceText = 'Difficulty set to easy';
        this.speak(this.voiceText);
      }else if (this.voiceText.toLowerCase().includes('medium')){
        this.difficulty = 'medium';
        this.voiceText = 'Difficulty set to medium';
        this.speak(this.voiceText);
      }else if (this.voiceText.toLowerCase().includes('hard')){
        this.difficulty = 'hard';
        this.voiceText = 'Difficulty set to hard';
        this.speak(this.voiceText);
      }
    }else if (this.voiceText.toLowerCase().includes('search') ||
        this.voiceText.toLowerCase().includes('go')){
      this.closeVoiceRecognition();
      this.submit();
    }else if (this.voiceText.toLowerCase().includes('bye')){
      this.closeVoiceRecognition();
    }
    else{
      this.voiceText = 'Sorry, I didn\'t understand';
      this.speak(this.voiceText);
    }
  }
}


