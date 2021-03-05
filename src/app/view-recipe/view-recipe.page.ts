import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import firebase from 'firebase';
import {RecipeItem} from '../shared/recipeItem';
import {RecipeItemService} from '../shared/recipe-item.service';
import {waitForAsync} from '@angular/core/testing';

@Component({
  selector: 'app-view-recipe',
  templateUrl: './view-recipe.page.html',
  styleUrls: ['./view-recipe.page.scss'],
})
export class ViewRecipePage implements OnInit {
  @ViewChild('one') d1: ElementRef;

  data: any;
  recipeImages: {[id: string]: string};
  recipe: any;
  img: any;
  pathReference: any;
  currentImg: number;
  recipeTextSteps: [];

  // Options for images slider
  option = {
    slidesPerView: 1.2,
    centeredSlides: true,
    loop: false,
    spaceBetween: 2,
  };

  constructor(private aptService: RecipeItemService, private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe(async params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.data = this.router.getCurrentNavigation().extras.state.recipe;

        document.getElementById('recipeText').textContent = ' '; // clear previous recipe
        this.recipeImages = {};
        this.currentImg = 0; // images on database are indexed from 0 to n

        // this.recipeTextSteps = this.data.recipeText.split('<endStep>');
        // Set title image
        const titleImage = document.getElementById('titleImage'); // Set title image (first image, with index 0)
        let urlSrc = await this.getNextImage();
        titleImage.setAttribute('src', urlSrc);

        // Get all recipe's steps (they are separated with <endStep> keywords)
        const recipeBlocks = this.data.recipeText.split('<endStep>');
        // tslint:disable-next-line:forin
        for (let j = 0; j < recipeBlocks.length; j++){ // for each step
          const innerBlocks = recipeBlocks[j].split('<endText>');   // separate the text from the images => text <endText> <img> <img> ...
          const text = innerBlocks[0]; // get the text in the current step (block)

          const recipeText = document.getElementById('recipeText');
          const ionCard = document.createElement('ion-card');
          const ionCardContent = document.createElement('ion-card-content');
          // @ts-ignore
          ionCardContent.textContent = text; // place the text in a ion-card-content tag
          ionCard.appendChild(ionCardContent);
          recipeText.appendChild(ionCard);

          if (innerBlocks.length > 1){ // The last block may not have images so innerblock[1] will be undefined
            const imagesNumber = (innerBlocks[1].match(/<img>/g) || []).length; // count number of '<img>' substrings in innerBlock[1]
            const slides = document.createElement('ion-slides');
            slides.className = 'ion-margin-top';
            slides.options = this.option;
            for (let i = 0; i < imagesNumber; i++){ // Insert all the images in this block

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

  ngOnInit(){
    if (this.data === undefined){
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

  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewInit() {

  }
}


/*
this.recipes = [];
res.forEach(item => {
  const myRecipeItem = item.payload.toJSON();
  // @ts-ignore
  myRecipeItem.$key = item.key;
  // get title image
  this.pathReference = firebase.storage().ref().child(item.key + '/' + item.key + '_0.jpg').getDownloadURL().then(url => {
    this.imgs = url;
    // @ts-ignore
    myRecipeItem.title_image = this.imgs;
  });

  // @ts-ignore
  if ((myRecipeItem.recipeTime as RecipeItem) < 20000000000) {
    this.recipes.push(myRecipeItem as RecipeItem);
  }
});*/
