import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import { IonContent } from '@ionic/angular';
import {IngredientsDic} from '../shared/recipeItem';
import {NavigationExtras, Router} from '@angular/router';
import {Platform} from '@ionic/angular';
import {SpeechRecognition} from '@ionic-native/speech-recognition/ngx';
import levenshtein from 'fast-levenshtein';
import {TextToSpeech} from '@ionic-native/text-to-speech/ngx';
import * as Bounce from 'bounce.js';
import firebase from 'firebase';
import {FixedCollectionItem} from '../presentation/presentation.page';
import {RecipeItemService} from '../shared/recipe-item.service';
import wordsToNumbers from 'words-to-numbers';


// import { Plugins } from '@capacitor/core';
// const { SpeechRecognition } = Plugins;


declare const annyang: any;

@Component({
  selector: 'app-search-recipe',
  templateUrl: './search-recipe.page.html',
  styleUrls: ['./search-recipe.page.scss'],
})
export class SearchRecipePage implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent;
  collectionsFetched = [];
  availablePulseToggleId = 'available_animated_disabled';
  undesiredPulseToggleId = 'undesired_animated_disabled';
  queryRecipeName: string;
  desiredIngredientsFilter: string;
  showAvailableSearchBarResults: boolean;
  showAvailableIngredients: boolean;
  showMainSearchBarResults: boolean;
  showMainIngredients: boolean;
  showUndesiredSearchBarResults: boolean;
  showUndesiredIngredients: boolean;
  ing: IngredientsDic;
  ingUndesired: IngredientsDic;
  ingMain: IngredientsDic;
  availableIngredientsKeys: {};
  mainIngredientsKeys: {};
  undesiredIngredientsKeys: {};
  availableIngredients: {};
  mainIngredients: {};
  undesiredIngredients: {};
  searchKeyword: boolean;
  searchAllIngredients: boolean;
  searchAvailableIngredients: boolean;
  searchMainIngredients: boolean;
  searchUndesiredIngredients: boolean;
  searchDifficulty: boolean;
  searchCollections: boolean;
  difficulty: string;
  collections = [];
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
              public ngZone: NgZone, private tts: TextToSpeech,
              private aptService: RecipeItemService) {

    this.queryRecipeName = '';
    this.difficulty = 'easy';
    this.showAvailableSearchBarResults = false;
    this.showMainSearchBarResults = false;
    this.showUndesiredSearchBarResults = false;
    this.ing = new IngredientsDic();
    this.ingMain = new IngredientsDic();
    this.ingUndesired = new IngredientsDic();
    this.availableIngredientsKeys = Object.keys(this.ing.ingredients);
    this.mainIngredientsKeys = Object.keys(this.ingMain.ingredients);
    this.undesiredIngredientsKeys = Object.keys(this.ingUndesired.ingredients);
    this.searchKeyword = false;
    this.searchAllIngredients = true;
    this.searchAvailableIngredients = true;
    this.showMainIngredients = false;
    this.searchUndesiredIngredients = false;
    this.searchDifficulty = false;
    this.searchCollections = false;
    this.searchRequiredTime = false;
    this.maxRequiredTime = 30;

    this.getCollections();

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

  ionViewWillEnter(){
    this.voiceActiveSectionDisabled = true;
    this.voiceActiveSectionError = false;
    this.voiceActiveSectionSuccess = false;
    this.voiceText = undefined;
    this.voiceTextUser = '';
    this.speaking = false;
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
      annyang.removeCallback();
      this.initializeVoiceRecognitionCallback();
      annyang.setLanguage('en-GB');
    }
  }


  ionViewDidLeave(){
    this.availablePulseToggleId = 'available_animated_disabled';
    this.undesiredPulseToggleId = 'undesired_animated_disabled';
    // remove this page annyang's callbacks
    this.closeVoiceRecognition();
  }

  reset_pulse_animation(element: string) {
    const el = document.getElementById(element);
    el.style.animation = 'none';
    // tslint:disable-next-line:no-unused-expression
    el.offsetHeight; /* trigger reflow */
    el.style.animation = null;
  }

  onChangeName(event){
    this.queryRecipeName = event.target.value;
  }

  allIngredientsChanged(event){
    if (event.target.value === 'availableIngredients'){
      this.searchAvailableIngredients = true;
      this.showAvailableIngredients = true;
      this.searchMainIngredients = false;
      this.showMainIngredients = false;
      this.showMainSearchBarResults = false;
    }else{
      this.searchAvailableIngredients = false;
      this.showAvailableIngredients = false;
      this.searchMainIngredients = true;
      this.showMainIngredients = true;
      this.showAvailableSearchBarResults = false;
    }
    this.showUndesiredSearchBarResults = false;
    this.reset_pulse_animation('mic_animated');
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
        return (item.toLowerCase().indexOf((val).split(' ').join('_').toLowerCase()) > -1);
      });
    }
  }

  // search bar for main ingredients
  _ionChangeMain(event){
    const val = event.target.value; // get the value in the search bar
    if (val.trim() !== ''){ // If the user has typed something
      this.showMainSearchBarResults = true;
    }else {
      this.showMainSearchBarResults = false;
    }

    this.mainIngredients = this.ingMain.ingredients;

    if (val && val.trim() !== ''){ // show only the ingredients that satisfies the query
      this.mainIngredients = Object.keys(this.mainIngredients).filter((item: any) => {
        return (item.toLowerCase().indexOf((val).split(' ').join('_').toLowerCase()) > -1);
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
        return (item.toLowerCase().indexOf((val).split(' ').join('_').toLowerCase()) > -1);
      });
    }
  }

  clearKeyword(){
    this.queryRecipeName = '';
  }

  toggleSearchKeyword(){
    this.searchKeyword = !this.searchKeyword;
    if (this.searchKeyword){
      this.bounce('keywordIcon', 1.1);
    }else{
      this.bounce('keywordIcon', 0.9);
    }
    this.resetSearchBars();
  }

  resetSearchBars(){
    this.showAvailableSearchBarResults = false;
    this.showMainSearchBarResults = false;
    this.showUndesiredSearchBarResults = false;
  }

  // check / uncheck available ingredients when clicked by user
  toggleAvailableIngredient(ingredient: unknown){
    // Change ingredient's state
    // @ts-ignore
    this.ing.ingredients[ingredient].selected = !this.ing.ingredients[ingredient].selected;
  }

  // check / uncheck available ingredients when clicked by user
  toggleMainIngredient(ingredient: unknown){
    // Change ingredient's state
    // @ts-ignore
    this.ingMain.ingredients[ingredient].selected = !this.ingMain.ingredients[ingredient].selected;
  }

  // check / uncheck undesired ingredients when clicked by user
  toggleUndesiredIngredient(ingredient: unknown){
    // Change ingredient's state
    // @ts-ignore
    this.ingUndesired.ingredients[ingredient].selected = !this.ingUndesired.ingredients[ingredient].selected;
  }

  // show available/main ingredients panel
  toggleSearchAllIngredients(){
    this.searchAllIngredients = !this.searchAllIngredients;
    if (this.searchAllIngredients){
      this.reset_pulse_animation('mic_animated');
    }
    if (this.searchAllIngredients){
      this.bounce('desiredIcon', 1.1);
    }else{
      this.bounce('desiredIcon', 0.9);
    }
    this.resetSearchBars();
  }

  // show search results only when these variables are true
  toggleSearchAvailableIngredients(){
    this.searchAvailableIngredients = !this.searchAvailableIngredients;
    this.showAvailableIngredients = !this.showAvailableIngredients;
  }

  toggleSearchMainIngredients(){
    this.searchMainIngredients = !this.searchMainIngredients;
    this.showMainIngredients = !this.showMainIngredients;
  }

  toggleSearchUndesiredIngredients(){
    this.searchUndesiredIngredients = !this.searchUndesiredIngredients;
    this.showUndesiredIngredients = !this.showUndesiredIngredients;
    if (this.searchUndesiredIngredients){
      this.reset_pulse_animation('mic_animated');
    }
    if (this.searchUndesiredIngredients){
      this.bounce('undesiredIcon', 1.1);
    }else{
      this.bounce('undesiredIcon', 0.9);
    }
    this.resetSearchBars();
  }

  // show difficulty settings when searchDifficulty is true
  toggleSearchDifficulty(){
    this.searchDifficulty = !this.searchDifficulty;
    if (this.searchDifficulty){
      this.reset_pulse_animation('mic_animated');
    }
    if (this.searchDifficulty){
      this.bounce('difficultyIcon', 1.1);
    }else{
      this.bounce('difficultyIcon', 0.9);
    }
    this.resetSearchBars();
  }
  // set difficulty (easy, medium or hard)
  toggleDifficulty(event){
    this.difficulty = event.target.value;
  }

  toggleSearchCollections(){
    this.searchCollections = !this.searchCollections;
    if (this.searchCollections){
      this.bounce('collectionIcon', 1.1);
    }else{
      this.bounce('collectionIcon', 0.9);
    }
    this.resetSearchBars();
  }

  toggleCollections(event){
    this.collections = event.target.value;
  }

  // show required time option
  toggleRequiredTime(){
    this.searchRequiredTime = !this.searchRequiredTime;
    if (this.searchAllIngredients){
      this.reset_pulse_animation('mic_animated');
    }
    if (this.searchRequiredTime){
      this.bounce('maxTimeIcon', 1.1);
    }else{
      this.bounce('maxTimeIcon', 0.9);
    }
  }

  // save the max time required
  timeRequiredChange(event){
    const hoursInMinutes = parseInt(String(event.target.value.split(':')[0] * 60) , 10);
    const minutes = parseInt(event.target.value.split(':')[1], 10);
    this.maxRequiredTime = hoursInMinutes + minutes;
  }

  async getCollections() {
    // importing the collections
    const collectionsRes = this.aptService.getCollectionsList();
    await collectionsRes.snapshotChanges().subscribe(col => {
      col.forEach(async collection => {
        const collectionItem = new FixedCollectionItem();
        collectionItem.name = collection.key;
        this.collectionsFetched.push(collectionItem);
      });
    });
  }



  // submit button. Send the query to the next page
  submit(){
    const query: {[queryRequest: string]: {}} = {};
    if (this.queryRecipeName !== ''){
      query.recipeName = this.queryRecipeName;
    }
    if (this.searchAvailableIngredients && this.searchAllIngredients){
      query.availableIngredients = this.ing.ingredients;
    }
    if (this.searchMainIngredients && this.searchAllIngredients){
      query.mainIngredients = this.ingMain.ingredients;
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
    if (this.searchCollections && this.collections.length > 0){
      query.collections = this.collections;
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
    this.bounce('mic_animated', 1.1);
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
    const availableSeparator = 'i have';
    const mainSeparator = 'i like';
    const undesiredSeparator = 'i don\'t want';
    if (this.combinedRequest(availableSeparator, undesiredSeparator, this.ing)){ // "I have milk, [...] and I don't want rice,[...]"
      return;
    }else if (this.combinedRequest(mainSeparator, undesiredSeparator, this.ingMain)){ // "I like milk, [...] and I don't want rice, [...]"
      return;
    }
    else if (this.voiceText.toLowerCase().includes(availableSeparator)){
      // "I have milk, [...]
      this.singleRequest(availableSeparator, this.ing, 'Available ingredients set');
    }
    else if (this.voiceText.toLowerCase().includes(mainSeparator)){
      // I like rice, [...]
      this.singleRequest(mainSeparator, this.ingMain, 'Main ingredients set');
    }
    else if (this.voiceText.toLowerCase().includes(undesiredSeparator)){
      // I don't want rice, [...]
      this.singleRequest(undesiredSeparator, this.ingUndesired, 'Undesired ingredients set');
    }else if (this.voiceText.toLowerCase().includes('set timer')){
      // Set timer to 30 minutes
      const elements = String(wordsToNumbers(this.voiceText.toLowerCase())).split('minutes')[0].split(' ');
      const minutes = elements[elements.length - 2];
      if (!isNaN(parseInt(minutes, 10)) && parseInt(minutes, 10) > 0){
        this.maxRequiredTime = parseInt(minutes, 10);
        this.searchRequiredTime = true;
        this.voiceText = 'Timer set';
        this.speak(this.voiceText);
        this.ScrollToPoint('summary_animated');
      }else{
        this.voiceText = 'Sorry, I didn\'t understand how many minutes';
        this.speak(this.voiceText);
      }
    }else if (this.voiceText.toLowerCase().includes('difficulty')) {
      // Set difficulty to easy
      if (this.voiceText.toLowerCase().includes('easy')) {
        this.searchDifficulty = true;
        this.difficulty = 'easy';
        this.voiceText = 'Difficulty set to easy';
        this.speak(this.voiceText);
        this.ScrollToPoint('summary_animated');
      } else if (this.voiceText.toLowerCase().includes('medium')) {
        this.searchDifficulty = true;
        this.difficulty = 'medium';
        this.voiceText = 'Difficulty set to medium';
        this.speak(this.voiceText);
        this.ScrollToPoint('summary_animated');
      } else if (this.voiceText.toLowerCase().includes('hard')) {
        this.searchDifficulty = true;
        this.difficulty = 'hard';
        this.voiceText = 'Difficulty set to hard';
        this.speak(this.voiceText);
        this.ScrollToPoint('summary_animated');
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

  combinedRequest(firstSeparator: string, undesiredSeparator: string, firstDic){
    if (this.voiceText.toLowerCase().includes(firstSeparator) && this.voiceText.toLowerCase().includes(undesiredSeparator)){
      this.ngZone.run(() => this.searchAllIngredients = true);
      if (firstSeparator === 'i have'){
        this.ngZone.run(() => {
          this.searchAvailableIngredients = true;
          this.showAvailableIngredients = true;
          this.searchMainIngredients = false;
          this.showMainIngredients = false;
          // this.bounce('availableIcon');
        });
      }else{
        this.ngZone.run(() => {
          this.searchAvailableIngredients = false;
          this.showAvailableIngredients = false;
          this.searchMainIngredients = true;
          this.showMainIngredients = true;
          // this.bounce('mainIcon');
        });
      }
      this.ngZone.run(() => {
        this.searchUndesiredIngredients = true;
        this.showUndesiredIngredients = true;
        // this.bounce('undesiredIcon');
      });
      const ingredients = Object.keys(this.ing.ingredients);
      // check where are user's available and undesired ingredients in the string
      const availableIngredientsS = this.voiceText.toLowerCase().split(firstSeparator);
      let dontWantIngredients = '';
      let availableIngredients = '';
      if (availableIngredientsS[1].includes(undesiredSeparator)){
        dontWantIngredients = availableIngredientsS[1].split(undesiredSeparator)[1];
        availableIngredients = availableIngredientsS[1].split(undesiredSeparator)[0];
      }else{
        availableIngredients = availableIngredientsS[1];
        dontWantIngredients = availableIngredientsS[0].split(undesiredSeparator)[1];
      }

      this.selectIngredients(firstDic, ingredients, firstSeparator + ' ' + availableIngredients, firstSeparator);
      this.selectIngredients(this.ingUndesired, ingredients, undesiredSeparator + ' ' + dontWantIngredients, undesiredSeparator);

      this.voiceText = 'Ingredients set';
      this.speak(this.voiceText);
      this.ngZone.run(() => this.ScrollToPoint('summary_animated'));
      return true;
    }else{
      return false;
    }
  }

  singleRequest(separator, ingredientsDic, speechText){
      const ingredients = Object.keys(ingredientsDic.ingredients);
      this.selectIngredients(ingredientsDic, ingredients, this.voiceText, separator);
      if (separator === 'i have'){
        this.ngZone.run(() => {
          this.searchAllIngredients = true;
          this.searchAvailableIngredients = true;
          this.showAvailableIngredients = true;
          this.searchMainIngredients = false;
          this.showMainIngredients = false;
          // this.bounce('availableIcon');
        });
    }else if (separator === 'i like'){
        this.ngZone.run(() => {
          this.searchAllIngredients = true;
          this.searchAvailableIngredients = false;
          this.showAvailableIngredients = false;
          this.searchMainIngredients = true;
          this.showMainIngredients = true;
          // this.bounce('mainIcon');
        });
    }else{
        this.ngZone.run(() => {
          this.searchUndesiredIngredients = true;
          this.showUndesiredIngredients = true;
          // this.bounce('undesiredIcon');
        });
    }
      this.voiceText = speechText;
      this.speak(this.voiceText);
      this.ngZone.run(() => this.ScrollToPoint('summary_animated'));
  }

  selectIngredients(ingredientsDictionary, ingredients, textAnalysed: string, separator: string){
    for (let i = 0; i < ingredients.length; i++) {
      if (ingredients[i].includes('_')){
        const currentIngredient = ingredients[i].split('_').join(' ').toLowerCase();
        if (textAnalysed.includes(currentIngredient)){
          ingredientsDictionary.ingredients[ingredients[i]].selected = true;
        }
      }
      else{
        const queryIngredients = textAnalysed.toLowerCase().split(separator)[1].split(' ');
        for (let j = 0; j < queryIngredients.length; j++) {
          if (levenshtein.get(queryIngredients[j], ingredients[i].toLowerCase()) <= 1) {
            ingredientsDictionary.ingredients[ingredients[i]].selected = true;
          }
        }
      }
    }
  }

  ScrollToPoint(element: string) {
    const yOffset = document.getElementById(element).offsetTop;
    this.content.scrollToPoint(0, yOffset, 2000);
  }

  bounce(id: string, end: number) {
    const bounce = new Bounce();
    bounce
        .scale({
          from: {x: 1, y: 1},
          to: {x: end, y: end},
          easing: 'sway',
          duration: 1000,
          delay: 0,
        })
        .applyTo(document.getElementsByClassName(id));
  }
}


