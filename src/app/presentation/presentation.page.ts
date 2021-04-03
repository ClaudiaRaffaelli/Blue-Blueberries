import { Component, OnInit } from '@angular/core';
import firebase from 'firebase';
import {RecipeItemService} from '../shared/recipe-item.service';
import {ActivatedRoute, NavigationExtras, Router} from '@angular/router';
import {IngredientsDic, RecipeItem} from '../shared/recipeItem';
import {Storage} from '@ionic/storage';
import {Platform} from "@ionic/angular";

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.page.html',
  styleUrls: ['./presentation.page.scss'],
})
export class PresentationPage implements OnInit {
  suggestedRecipes = [];
  pathReference: any;
  recipesRes: any;
  collectionsRes: any;
  imgs: []; // Title images downloaded from the firebase storage
  suggestionsNumber = 3; // suggested recipes
  dataFetched: boolean; // flag that indicates when all recipes data have been downloaded from the database
  collections = []

  // Options for images slider
  option = {
    slidesPerView: 1.2,
    centeredSlides: true,
    loop: false,
    spaceBetween: 1,
  };

  constructor(
      private aptService: RecipeItemService,
      private route: ActivatedRoute,
      private router: Router,
      public storage: Storage,
      private platform: Platform) {

    storage.set(`allergies`, []);
    storage.set(`desiredFood`, []);
    storage.set(`undesiredFood`, []);
  }


  async ngOnInit() {
    this.recipesRes = this.aptService.getRecipesList();
    this.recipesRes.snapshotChanges().subscribe(res => {
      this.dataFetched = false;
      this.suggestedRecipes = [];
      const rndRes = [];
      for (let i = 0; i < this.suggestionsNumber; i++){
        rndRes.push(res[Math.floor(Math.random() * res.length)]); // push a random element
      }
      rndRes.forEach(item => {
        const myRecipeItem = item.payload.toJSON();
        // @ts-ignore
        myRecipeItem.$key = item.key;
        // get title image
        this.pathReference = firebase.storage().ref().child(item.key + '/' + item.key + '_0.jpg').getDownloadURL().then(url => {
          this.imgs = url;
          // @ts-ignore
          myRecipeItem.title_image = this.imgs;
        });
        this.suggestedRecipes.push(myRecipeItem as RecipeItem);
      });

    });

    // importing the collections
    this.collectionsRes = this.aptService.getCollectionsList();
    await this.collectionsRes.snapshotChanges().subscribe( col => {
      col.forEach( async collection => {

        let collectionItem = new FixedCollectionItem()
        collectionItem.name = collection.key

        // taking from the first recipe in the collection the cover image for the collection itself
        let [firstRecipeKey] = Object.keys(collection.payload.toJSON());

        await firebase.storage().ref().child(firstRecipeKey + '/' + firstRecipeKey + '_0.jpg').getDownloadURL().then(async url => {
          collectionItem.coverImage = url;
        });

        collectionItem.recipeList = Object.keys(collection.payload.toJSON());

        collectionItem.numberOfRecipes = collectionItem.recipeList.length;
        this.collections.push(collectionItem);


      });
      this.dataFetched = true;

    });

  }

  ionViewDidLeave(){
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigate(['presentation']);
    });
  }

  openRecipe(recipeP: any){
    const navigationExtras: NavigationExtras = {
      state: {
        recipe: recipeP,
        lastPage: 'presentation'
      }
    };
    this.router.navigate(['view-recipe'], navigationExtras);
  }

  openCollection(collectionP: any){

    const navigationExtras: NavigationExtras = {
      state: {
        collection: collectionP,
        lastPage: 'presentation'
      }
    };
    this.router.navigate(['home'], navigationExtras);
  }

}

export class FixedCollectionItem {
  name: string;
  recipeList: any;
  numberOfRecipes: number;
  coverImage: any;
}
