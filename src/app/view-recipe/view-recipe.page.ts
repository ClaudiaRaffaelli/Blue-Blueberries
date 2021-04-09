import {Component, OnInit, NgZone, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import firebase from 'firebase';
import {RecipeItemService} from '../shared/recipe-item.service';
import {BehaviorSubject} from 'rxjs';
import * as Bounce from 'bounce.js';
import {IonContent, Platform, PopoverController} from '@ionic/angular';
import {TextToSpeech} from '@ionic-native/text-to-speech/ngx';
import {PopoverCollectionsComponent} from '../popover-collections/popover-collections.component';
import { Insomnia } from '@ionic-native/insomnia/ngx';
import {GroceriesService} from '../shared/groceries.service';
import {CollectionItemService} from '../shared/collection-item.service';
import {SpeechRecognition} from '@ionic-native/speech-recognition/ngx';
import wordsToNumbers from 'words-to-numbers';

declare const annyang: any;

@Component({
  selector: 'app-view-recipe',
  templateUrl: './view-recipe.page.html',
  styleUrls: ['./view-recipe.page.scss'],
})
export class ViewRecipePage implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent;
  recipeInFavorites: boolean;
  data: any;
  recipeImages: { [id: string]: string };
  recipe: any;
  desiredFood: string[];
  img: any;
  pathReference: any;
  currentImg: number;
  recipeTextSteps: [];
  difficultyColor: string;
  stepsNumber: number;
  // timer parameters
  time: BehaviorSubject<string> = new BehaviorSubject('00:00');
  timer: number; // in seconds
  interval;
  duration = 0; // starting time (in minutes)
  timerHour = '';
  timerState: 'start' | 'stop' = 'stop'; // it can be either start or stop
  timerToggle: boolean;

  isInGroceryList: boolean;
  recipeNumberInCart = 0; // holds the number of recipes currently inside the cart for the grocery list

  isInAnyCollection = false; // it holds the boolean that says if the heart icon has to be full or empty

  lastPage: string;
  textSteps: {[id: string]: string};

  // Options for images slider
  option = {
    slidesPerView: 1.2,
    centeredSlides: true,
    loop: false,
    spaceBetween: 2,
  };

  // voice assistant parameters (annyang)
  voiceActiveSectionDisabled = true;
  voiceActiveSectionError = false;
  voiceActiveSectionSuccess = false;
  voiceActiveSectionListening = false;
  voiceText: any;
  assistantButtonColor: string;
  voiceTextUser = '';
  speaking: boolean;


  constructor(private aptService: RecipeItemService,
              private route: ActivatedRoute,
              private router: Router,
              public platform: Platform,
              private tts: TextToSpeech,
              public popoverController: PopoverController,
              private insomnia: Insomnia,
              private groceriesService: GroceriesService,
              public ngZone: NgZone,
              private localDBService: CollectionItemService,
              private speechRecognition: SpeechRecognition) {

    // Check if speech recognition is available
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


    this.insomnia.keepAwake();
    this.timerToggle = false;
    this.route.queryParams.subscribe(async params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.data = this.router.getCurrentNavigation().extras.state.recipe;

        this.lastPage = this.router.getCurrentNavigation().extras.state.lastPage;

        // getting the Favorites collection
        this.localDBService.getCollectionItem('Favorites').then(async res => {
          // if there is no Favorites collection, we create it
          if (res === null){
            await this.localDBService.createFavoritesCollection();
          }else{
            await res;
          }
          // set a boolean to know if the recipe is in the favorites this is used to show a different icon in the popup
          this.recipeInFavorites = await this.localDBService.isRecipeInCollection('Favorites', this.data.$key);
        });

        document.getElementById('recipeText').textContent = ' '; // clear previous recipe
        this.currentImg = 0; // images on database are indexed from 0 to n
        this.recipeImages = {};

        // set difficulty icon's color
        switch (this.data.recipeDifficulty.toLowerCase()) {
          case 'easy':
            this.difficultyColor = 'success';
            break;
          case 'medium':
            this.difficultyColor = 'warning';
            break;
          case 'hard':
            this.difficultyColor = 'danger';
            break;
        }

        // Set title image
        const titleImage = document.getElementById('titleImage'); // Set title image (first image, with index 0)
        let urlSrc = await this.getNextImage();
        titleImage.setAttribute('src', urlSrc);

        await this.groceriesService.getGroceryList().then(item => {
          this.recipeNumberInCart = item.length;
        });


        this.textSteps = {};
        // Get all recipe's steps (they are separated with <endStep> keywords)
        const recipeBlocks = this.data.recipeText.split('<endStep>');
        this.stepsNumber = recipeBlocks.length;
        // tslint:disable-next-line:forin
        for (let j = 0; j < this.stepsNumber; j++) { // for each step
          const innerBlocks = recipeBlocks[j].split('<endText>');   // separate the text from the images => text <endText> <img> <img> ...
          this.textSteps[j] = innerBlocks[0]; // get the text in the current step (block)

          const recipeText = document.getElementById('recipeText');
          const ionCard = document.createElement('ion-card');
          ionCard.setAttribute('style', 'border-radius: 15px; margin-top: 1px !important;');
          ionCard.setAttribute('id', 'step ' + (j + 1));
          const ionCardHeader = document.createElement('ion-card-header');
          const ionCardHeaderLabel = document.createElement('ion-label');
          const ionCardHeaderLabelH1 = document.createElement('h1');

          const ionDownIconButton = document.createElement('ion-icon');
          ionDownIconButton.setAttribute('name', 'chevron-down-circle-sharp');
          ionDownIconButton.setAttribute('size', 'large');
          ionDownIconButton.setAttribute('color', 'mainLight');
          ionDownIconButton.addEventListener('click', () => { this.ScrollToPoint('step ' + (j + 2)); });
          const ionUpIconButton = document.createElement('ion-icon');
          ionUpIconButton.setAttribute('name', 'chevron-up-circle-sharp');
          ionUpIconButton.setAttribute('size', 'large');
          ionUpIconButton.setAttribute('color', 'mainLight');
          ionUpIconButton.addEventListener('click', () => { this.ScrollToPoint('step ' + j); });

          const ionGrid = document.createElement('ion-grid');
          const ionRow = document.createElement('ion-row');
          ionRow.setAttribute('class', 'ion-align-items-center');
          const ionColStep = document.createElement('ion-col');
          ionColStep.setAttribute('size', '5');
          const ionColBlank = document.createElement('ion-col');
          ionColBlank.setAttribute('size', '3');
          const ionColDown = document.createElement('ion-col');
          ionColDown.setAttribute('size', '2');
          const ionColUp = document.createElement('ion-col');
          ionColUp.setAttribute('size', '2');

          ionCardHeaderLabel.textContent = 'Step ' + (j + 1);
          ionCardHeaderLabelH1.appendChild(ionCardHeaderLabel);
          ionColStep.appendChild(ionCardHeaderLabelH1);
          ionColDown.appendChild(ionDownIconButton);
          ionColUp.appendChild(ionUpIconButton);
          ionRow.appendChild(ionColStep);
          ionRow.appendChild(ionColBlank);
          ionRow.appendChild(ionColDown);
          ionRow.appendChild(ionColUp);
          ionGrid.appendChild(ionRow);
          ionCardHeader.appendChild(ionGrid);
          ionCardHeader.setAttribute('style', 'color: #225A8F!important;');

          const ionCardContent = document.createElement('ion-card-content');
          // @ts-ignore
          ionCardContent.textContent = this.textSteps[j]; // place the text in a ion-card-content tag
          ionCard.appendChild(ionCardHeader);
          ionCard.appendChild(ionCardContent);
          recipeText.appendChild(ionCard);

          if (innerBlocks.length > 1) { // The last block may not have images so innerblock[1] will be undefined
            const imagesNumber = (innerBlocks[1].match(/<img>/g) || []).length; // count number of '<img>' substrings in innerBlock[1]
            const slides = document.createElement('ion-slides');
            slides.className = 'ion-margin-top';
            slides.options = this.option;
            for (let i = 0; i < imagesNumber; i++) { // Insert all the images in this block
              const slide = document.createElement('ion-slide');
              const imgCard = document.createElement('ion-card');
              imgCard.className = 'recipeImageCard';
              const img = document.createElement('img'); // to do so create the tag <img>
              // img.className = 'recipeImage';
              img.setAttribute('style', 'transform: scale(1.1, 1.1);');

              urlSrc = await this.getNextImage(); // get next image's url
              img.setAttribute('src', urlSrc); // set the src attribute

              imgCard.appendChild(img);
              slide.appendChild((imgCard));
              slides.appendChild(slide);
            }

            recipeText.append(slides);

          }
        }
      }
      // let recipeList = await this.groceriesService.getGroceryList();
      // this.recipeNumberInCart=recipeList.length;
    });
  }

  async ngOnInit() {
  }


  ionViewDidEnter(){
    // Desiredfood
    this.desiredFood = [];
    try{
      this.desiredFood = Object.keys(this.data.desiredFood);
    }catch (e) {}
  }

  async ionViewWillEnter(){
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigate([this.lastPage]);
    });
    if (this.data === undefined) {
      this.router.navigate(['presentation']);
    }

    await this.groceriesService.getGroceryList().then(item => {
      this.recipeNumberInCart = item.length;
    });

    // find out if the recipe is in the grocery list and display a different icon accordingly
    await this.groceriesService.getGroceryList().then(async groceryList => {
      this.isInGroceryList = !!groceryList.includes(this.data.$key);
    });

    // when the popover is dismissed we see if we have to change the status of the heart icon
    this.isInAnyCollection = await this.localDBService.isRecipeInAnyCollection(this.data.$key);



    // Annyang
    this.voiceActiveSectionDisabled = true;
    this.voiceActiveSectionError = false;
    this.voiceActiveSectionSuccess = false;
    this.voiceText = undefined;
    this.speaking = false;
    if (annyang) {
      annyang.removeCallback();
      this.initializeVoiceRecognitionCallback();
      annyang.setLanguage('en-GB');
    }
  }

  ionViewDidLeave(){
    this.insomnia.allowSleepAgain();
    // Remove this page annyang's callbacks
    this.stopSpeaking();
  }

  async getNextImage() {
    const path = this.data.$key + '/' + this.data.$key + '_' + this.currentImg + '.jpg';
    this.currentImg++;
    const urlSrc = await firebase.storage().ref().child(path).getDownloadURL().then(url => {
      return url;
    });
    return urlSrc;
  }

  searchSpecificDesiredFood(food: string){
    const query: {[queryRequest: string]: {}} = {};
    query.specificDesiredFood = food;

    const navigationExtras: NavigationExtras = {
      state: {
        query,
        lastPage: 'view-recipe'
      }
    };
    this.router.navigate(['home'], navigationExtras);
  }

  startTimer() {
    this.timerState = 'start';
    clearInterval(this.interval);
    this.timer = this.duration * 60;
    this.updateTimeValue();
    this.interval = setInterval(() => {
      this.updateTimeValue();
    }, 1000); // 1000 means every second
  }

  stopTimer() {
    clearInterval(this.interval);
    this.time.next('00:00');
    this.timerState = 'stop';
  }

  async updateTimeValue() {
    let minutes: any = (this.timer / 60) % 60;
    let hour: any = (this.timer / 60) / 60;
    let seconds: any = this.timer % 60;

    hour = String('0' + Math.floor(hour)).slice(-2);
    minutes = String('0' + Math.floor(minutes)).slice(-2);
    seconds = String('0' + Math.floor(seconds)).slice(-2);

    const text = hour + ':' + minutes + ':' + seconds;
    this.time.next(text);

    if ((this.timer) % 30 === 0) {
      this.bounceTimer('timer');
    }
    --this.timer;
    if (this.timer === 0) {
      this.stopTimer();
    }
  }

  setTimer(event) {
    const hoursInMinutes = parseInt(String(event.target.value.split(':')[0] * 60) , 10);
    const minutes = parseInt(event.target.value.split(':')[1], 10);
    this.duration = hoursInMinutes + minutes;
    this.startTimer();
  }

  toggleTimer() {
    this.timerToggle = !this.timerToggle;
    this.bounceTimer('timer');
  }

  bounceTimer(id: string) {
    const bounce = new Bounce();
    bounce
        .scale({
          from: {x: 1, y: 1},
          to: {x: 2, y: 2},
          easing: 'sway',
          duration: 300,
          delay: 0,
        })
        .applyTo(document.getElementById(id));

  }

  async speak(text){
    this.assistantButtonColor = 'warning';
    annyang.abort();
    this.speaking = true;
    await this.tts.speak({
      text,
      rate: 0.9
    })
        .then(() => {
          this.startVoiceRecognition();
          this.speaking = false;
        })
        .catch((reason: any) => console.log(reason));
  }

  async speakStep(stepNumber){
    this.assistantButtonColor = 'warning';
    annyang.abort();
    this.speaking = true;
    await this.tts.speak({
      text: 'Step ' + stepNumber + '.' + this.textSteps[stepNumber - 1],
      rate: 0.9
    })
        .then(() => {
          this.startVoiceRecognition();
          this.speaking = false;
        })
        .catch((reason: any) => console.log(reason));
  }

  stopSpeaking(){
    this.tts.speak('')
        .then(() => {
          this.speaking = false;
          this.closeVoiceRecognition();
        })
        .catch((reason: any) => console.log(reason));
  }

  async presentPopover(eve: any, recipeKey: string) {
    this.bounceTimer('presentPopover');
    const popover = await this.popoverController.create({
      component: PopoverCollectionsComponent,
      cssClass: 'popOver',
      componentProps: {
        // communicating the recipe key to the popover for when the recipe will be added to the collection
        recipeKey,
      },
      event: eve,
      mode: 'ios',
      translucent: true
    });

    popover.onWillDismiss().then(() => {
      // alert("before dismissing the popover")
    });
    popover.onDidDismiss().then(async () => {
      // when the popover is dismissed we see if we have to change the status of the heart icon
      this.isInAnyCollection = await this.localDBService.isRecipeInAnyCollection(recipeKey);
    });
    return await popover.present();
  }

  async addRemoveCart(recipeKey: string){

    // toggle the recipe inside the cart and change the icon accordingly
    await this.groceriesService.addRemoveRecipeFromGrocery(recipeKey);
    this.isInGroceryList = ! this.isInGroceryList;
    if (this.isInGroceryList === true){
      // the recipe has been added, so there is one more recipe inside the cart
      this.recipeNumberInCart ++;
    }else{
      this.recipeNumberInCart --;
    }
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
    if (this.voiceText.toLowerCase().includes('step')){
      const step = String(wordsToNumbers(this.voiceText.toLowerCase())).split('step')[1].split(' ')[1];
      if (parseInt(step, 10) <= this.stepsNumber){
        this.ScrollToPoint('step ' + step);
        this.speakStep(step);
      }else{
        this.speak('Sorry, there isn\'t a step ' + step + '.');
      }
    }else if (this.voiceText.toLowerCase().includes('timer')){
      // Set timer to 30 minutes
      this.voiceText = this.voiceText.split('-').join(' ').toLowerCase();
      let elements;
      if (this.voiceText.includes('minutes')){
        elements = String(wordsToNumbers(this.voiceText)).split('minutes')[0].split(' ');
      }else if (this.voiceText.includes('minute')){
        elements = String(wordsToNumbers(this.voiceText)).split('minute')[0].split(' ');
      }
      const minutes = elements[elements.length - 2];
      if (!isNaN(parseInt(minutes, 10)) && parseInt(minutes, 10) > 0){
        this.duration = parseInt(minutes, 10);
        this.timerToggle = true;
        this.bounceTimer('timer');
        this.startTimer();
        this.speak('Timer set');
      }else{
        this.speak('Sorry, I didn\'t understand how many minutes');
      }
    }else if (this.voiceText.toLowerCase().includes('add') && (this.voiceText.toLowerCase().includes('favorites'))){
      this.addDeleteFromFavorites('add');
    }else if (this.voiceText.toLowerCase().includes('remove') && (this.voiceText.toLowerCase().includes('favorites'))){
      this.addDeleteFromFavorites('remove');
    }else if (this.voiceText.toLowerCase().includes('add') && this.voiceText.toLowerCase().includes('grocery list')) {
      if (!this.isInGroceryList) {
        this.addRemoveCart(this.data.$key);
        this.speak('Added to your grocery list');
      } else {
        this.speak('Already in grocery list');
      }
    }else if (this.voiceText.toLowerCase().includes('remove') && this.voiceText.toLowerCase().includes('grocery list')) {
      if (this.isInGroceryList) {
        this.addRemoveCart(this.data.$key);
        this.speak('Removed from your grocery list');
      } else {
        this.speak('Sorry, it isn\'t in grocery list');
      }
    }else if (this.smallTalks(this.voiceText.toLowerCase())){
      return;
    }
    else{
      this.speak('Sorry, I didn\'t understand');
    }
  }

  ScrollToPoint(element: string) {
    console.log(element);
    const yOffset = document.getElementById(element).offsetTop;
    console.log(yOffset);
    this.content.scrollToPoint(0, yOffset, 2000);
  }

  async addDeleteFromFavorites(action: string){
    if (action === 'add'){
      if (!this.recipeInFavorites){
        // adding the recipe to the collection
        await this.localDBService.addRecipeToCollectionItem('Favorites', this.data.$key);
        // updating the icon by setting the recipe as added to the collection
        this.recipeInFavorites = true;
        // we also check if we have to change the status of the heart icon of collections
        this.isInAnyCollection = await this.localDBService.isRecipeInAnyCollection(this.data.$key);
        this.speak('added to favorites');
      }else{
        this.speak('Sorry, already in favorites');
      }
    }else if (action === 'remove'){
      if (this.recipeInFavorites){
        // removing the recipe from the collection
        await this.localDBService.deleteRecipeFromCollectionItem('Favorites', this.data.$key);
        this.recipeInFavorites = false;
        // we also check if we have to change the status of the heart icon of collections
        this.isInAnyCollection = await this.localDBService.isRecipeInAnyCollection(this.data.$key);
        this.speak('removed from favorites');
      }else{
        this.speak('Sorry, this recipe is not in your favorites');
      }
    }
  }

  smallTalks(text: string){
    if (text.includes('hello') || text.includes('hey')){
      this.speak('Hey, what\'s up?');
      return true;
    }
    if (text.includes('How are you')){
      this.speak('I\'m fine, thanks for asking');
      return true;
    }
    if (text.includes('who are you') || text.includes('what are you') || text.includes('what\'s your name')){
      this.speak('I\'m Cindy, your personal assistant');
      return true;
    }
    if (text.includes('what can you do') || text.includes('what can i do') || text.includes('help') || text.includes('what can i ask you')){
      this.speak('Try usging commands like: "set time of 60 minutes", "add to favorites", "add to grocery list" or "go to step four"');
      return true;
    }
  }
}
