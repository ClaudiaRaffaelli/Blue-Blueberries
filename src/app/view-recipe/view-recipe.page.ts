import {Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import firebase from 'firebase';
import {RecipeItemService} from '../shared/recipe-item.service';
import {BehaviorSubject} from 'rxjs';
import * as Bounce from 'bounce.js';
import {Platform} from '@ionic/angular';
import {TextToSpeech} from '@ionic-native/text-to-speech/ngx';


@Component({
  selector: 'app-view-recipe',
  templateUrl: './view-recipe.page.html',
  styleUrls: ['./view-recipe.page.scss'],
})
export class ViewRecipePage implements OnInit {
  data: any;
  recipeImages: { [id: string]: string };
  recipe: any;
  img: any;
  pathReference: any;
  currentImg: number;
  recipeTextSteps: [];
  difficultyColor: string;
  // timer parameters
  time: BehaviorSubject<string> = new BehaviorSubject('00:00');
  timer: number; // in seconds
  interval;
  duration = 0; // starting time (in minutes)
  timerHour = '';
  timerState: 'start' | 'stop' = 'stop'; // it can be either start or stop
  timerToggle: boolean;

  lastPage: string;
  textSteps: {[id: string]: string};

  // Options for images slider
  option = {
    slidesPerView: 1.2,
    centeredSlides: true,
    loop: false,
    spaceBetween: 2,
  };

  constructor(private aptService: RecipeItemService,
              private route: ActivatedRoute,
              private router: Router,
              public platform: Platform,
              private tts: TextToSpeech) {
    this.timerToggle = false;
    this.route.queryParams.subscribe(async params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.data = this.router.getCurrentNavigation().extras.state.recipe;
        if (!this.data){
          this.router.navigate(['presentation']);
        }
        this.lastPage = this.router.getCurrentNavigation().extras.state.lastPage;

        document.getElementById('recipeText').textContent = ' '; // clear previous recipe
        this.recipeImages = {};
        this.currentImg = 0; // images on database are indexed from 0 to n

        // set difficulty icon's color
        switch (this.data.recipeDifficulty) {
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

        this.textSteps = {};
        // Get all recipe's steps (they are separated with <endStep> keywords)
        const recipeBlocks = this.data.recipeText.split('<endStep>');
        // tslint:disable-next-line:forin
        for (let j = 0; j < recipeBlocks.length; j++) { // for each step
          const innerBlocks = recipeBlocks[j].split('<endText>');   // separate the text from the images => text <endText> <img> <img> ...
          this.textSteps[j] = innerBlocks[0]; // get the text in the current step (block)

          const recipeText = document.getElementById('recipeText');
          const ionCard = document.createElement('ion-card');
          ionCard.setAttribute('style', 'border-radius: 15px; margin-top: 1px !important;');
          const ionCardHeader = document.createElement('ion-card-header');
          const ionCardHeaderLabel = document.createElement('ion-label');
          const ionCardHeaderLabelH1 = document.createElement('h1');

          const ionMicIconButton = document.createElement('ion-icon');
          ionMicIconButton.setAttribute('name', 'mic-outline');
          ionMicIconButton.setAttribute('size', 'large');
          ionMicIconButton.addEventListener('click', () => { this.speak(j); });

          const ionGrid = document.createElement('ion-grid');
          const ionRow = document.createElement('ion-row');
          ionRow.setAttribute('class', 'ion-align-items-center');
          const ionColStep = document.createElement('ion-col');
          ionColStep.setAttribute('size', '5');
          const ionColBlank = document.createElement('ion-col');
          ionColBlank.setAttribute('size', '5');
          const ionColMic = document.createElement('ion-col');
          ionColMic.setAttribute('size', '2');

          ionCardHeaderLabel.textContent = 'Step ' + (j + 1);
          ionCardHeaderLabelH1.appendChild(ionCardHeaderLabel);
          ionColStep.appendChild(ionCardHeaderLabelH1);
          ionColMic.appendChild(ionMicIconButton);
          ionRow.appendChild(ionColStep);
          ionRow.appendChild(ionColBlank);
          ionRow.appendChild(ionColMic);
          ionGrid.appendChild(ionRow);
          ionCardHeader.appendChild(ionGrid);
          ionCardHeader.setAttribute('color', 'tertiary');

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
              img.className = 'recipeImage';

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
    });
  }

  ngOnInit() {
    if (this.data === undefined) {
      this.router.navigate(['home']);
    }
  }

  async getNextImage() {
    const path = this.data.$key + '/' + this.data.$key + '_' + this.currentImg + '.jpg';
    this.currentImg++;
    const urlSrc = await firebase.storage().ref().child(path).getDownloadURL().then(url => {
      return url;
    });
    return urlSrc;
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
          to: {x: 3, y: 2},
          easing: 'sway',
          duration: 300,
          delay: 50,
        })
        .applyTo(document.getElementById(id));

  }

  async speak(stepNumber){
    await this.tts.speak({
      text: 'Step ' + (stepNumber + 1) + '. ' + this.textSteps[stepNumber],
      rate: 0.9
    })
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log(reason));
  }

  stopSpeaking(){
    this.tts.speak('')
        .then(() => console.log('Success'))
        .catch((reason: any) => console.log(reason));
  }

}
