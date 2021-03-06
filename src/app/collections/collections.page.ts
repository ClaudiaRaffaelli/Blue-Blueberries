import {Component, OnInit} from '@angular/core';
import {RecipeItem} from '../shared/recipeItem';
import {CollectionItem} from '../shared/collectionItem';
import {RecipeItemService} from '../shared/recipe-item.service';
import {CollectionItemService} from '../shared/collection-item.service';
import firebase from 'firebase';
import 'firebase/storage'; // in order to use images stored in the firebase database
import {NavigationExtras, Router} from '@angular/router'; // pass data between two pages
import {Storage} from '@ionic/storage';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.page.html',
  styleUrls: ['./collections.page.scss'],
})
export class CollectionsPage implements OnInit {

  recipes = []; // Here are going to be saved all the recipes downloaded from the database
  collections = []; // Here will be saved all the collections stored from local Ionic Storage
  pathReference: any;
  imgs: []; // Title images downloaded from the firebase storage

  constructor(
      private localDBService: CollectionItemService,
      private aptService: RecipeItemService,
      private router: Router,
      private storage: Storage
  ) {
    // making sure that local storage is ready
    storage.ready().then(() => {
    });
  }

  ngOnInit() {

    this.fetchRecipeItems();
    const recipesRes = this.aptService.getRecipesList();
    recipesRes.snapshotChanges().subscribe(res => {
      this.recipes = [];
      res.forEach(item => {
        const myRecipeItem = item.payload.toJSON();

        // TODO testing di aggiunta ricetta singola
        //this.localDBService.addRecipeToCollectionItem("CollezioneA", myRecipeItem)
        //this.addRecipeToCollectionItem("MiaCollezione", myRecipeItem)
        //this.deleteRecipeFromCollectionItem("CollezioneA", myRecipeItem)
        // @ts-ignore
        myRecipeItem.$key = item.key;

        // get title image
        this.pathReference = firebase.storage().ref().child(item.key + '/' + item.key + '_0.jpg').getDownloadURL().then(url => {
          this.imgs = url;
          // @ts-ignore
          myRecipeItem.title_image = this.imgs;
        });
        // @ts-ignore
        this.recipes.push(myRecipeItem as RecipeItem);
      });

      // TODO some testing
      let collectionItem = new CollectionItem()
      collectionItem.recipeList = this.recipes
      collectionItem.recipeNumber = this.recipes.length
      //this.localDBService.addCollectionItem("CollezioneB", collectionItem)
      this.localDBService.deleteCollectionItem("CollezioneB")
      //this.localDBService.addCollectionItem("CollezioneA", collectionItem)
      //this.addCollectionItem("MiaCollezione", collectionItem)
      //this.deleteCollectionItem("MiaCollezione")
      //this.addCollectionItem("CollezioneA", collectionItem)
      this.localDBService.getCollectionItem("MiaCollezione").then(
          (item) => console.log('Il contenuto della collezione Mia è ', item)
      );
      this.localDBService.getCollectionItem("CollezioneA").then(
          (item) => console.log('Il contenuto della collezione A è ', item)
      );
      this.localDBService.getCollectionItem("CollezioneB").then(
          (item) => console.log('Il contenuto della collezione B è ', item)
      );
    });

  }

  openRecipe(recipeP: any) {
    const navigationExtras: NavigationExtras = {
      state: {
        recipe: recipeP
      }
    };
    this.router.navigate(['view-recipe'], navigationExtras);

  }

  fetchRecipeItems() {
    this.aptService.getRecipesList().valueChanges().subscribe(res => {
    });
  }

  deleteRecipeItem(id) {
    if (window.confirm('Do you really want to delete?')) {
      this.aptService.deleteRecipe(id);
    }
  }

  fetchCollectionItems(){
    //this.localDBService.getAllCollectionItems()
  }

}






