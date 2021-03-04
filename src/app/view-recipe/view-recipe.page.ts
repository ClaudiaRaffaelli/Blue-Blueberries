import { Component, OnInit } from '@angular/core';
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

  data: any;
  recipeImages: {[id: string]: string};
  recipe: any;
  img: any;
  pathReference: any;
  currentImg: number;
  recipeTextSteps: [];

  constructor(private aptService: RecipeItemService, private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe(async params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.data = this.router.getCurrentNavigation().extras.state.recipe;

        document.getElementById('recipeText').textContent = ' ';
        this.recipeImages = {};
        this.currentImg = 0;

        // this.recipeTextSteps = this.data.recipeText.split('<endStep>');
        // Set title image
        const titleImage = document.getElementById('titleImage');
        let urlSrc = await this.getNextImage();
        titleImage.setAttribute('src', urlSrc);

        // Get all recipe's steps
        const recipeBlocks = this.data.recipeText.split('<endStep>');
        // tslint:disable-next-line:forin
        for (let j = 0; j < recipeBlocks.length; j++){
          const innerBlocks = recipeBlocks[j].split('<endText>');   // text <endText> <img> <img> <img>

          const text = innerBlocks[0]; // get the text in the current step (block)

          const recipeText = document.getElementById('recipeText');
          const ionCard = document.createElement('ion-card');
          const ionCardContent = document.createElement('ion-card-content');
          // @ts-ignore
          ionCardContent.textContent = text;
          ionCard.appendChild(ionCardContent);
          recipeText.appendChild(ionCard);
          recipeText.append(document.createElement('br'));

          if (innerBlocks.length > 1){ // The last block may not have images so inneblock[1] will undefined
            const imagesNumber = (innerBlocks[1].match(/<img>/g) || []).length; // cont number of substring '<img>'
            for (let i = 0; i < imagesNumber; i++){ // Insert all the images in this block
              const img = document.createElement('img'); // create the tag <img>
              urlSrc = await this.getNextImage(); // get next image's url
              img.setAttribute('src', urlSrc); // set the src attribute
              recipeText.append(img);
            }
          }
        }
      }
    });
  }

  ngOnInit(){
  }

  async getNextImage() {
    const path = this.data.$key + '/' + this.data.$key + '_' + this.currentImg + '.jpg';
    this.currentImg++;
    const urlSrc = await firebase.storage().ref().child(path).getDownloadURL().then(url => {
      return url;
    });
    return urlSrc;
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
