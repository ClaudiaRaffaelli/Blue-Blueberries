import {Component, OnInit} from '@angular/core';
import {RecipeItem} from '../shared/recipeItem';
import {RecipeItemService} from '../shared/recipe-item.service';
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
  pathReference: any;
  imgs: []; // Title images downloaded from the firebase storage

  constructor(
      private aptService: RecipeItemService,
      private router: Router,
      private storage: Storage
  ) {
    // making sure that local storage is ready
    storage.ready().then(() => {});
  }

  ngOnInit() {

    this.fetchRecipeItems();
    const recipesRes = this.aptService.getRecipesList();
    recipesRes.snapshotChanges().subscribe(res => {
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
        this.recipes.push(myRecipeItem as RecipeItem);
      });

      // TODO some testing
      this.addCollectionItem("MiaCollezione", this.recipes)
      this.getCollectionItem("MiaCollezione").then(
          (item) => console.log('Il contenuto della collezione è ', item)
      );
    });

  }
  openRecipe(recipeP: any){
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

  // Local storage methods for handling personalized collections
  // TODO ok
  addCollectionItem(collectionName, recipeItemList){
    // key: collectionName (string), value: list of recipeItem objects
    // the list of recipeItem is first converted into a string
    let json = JSON.stringify(recipeItemList);
    this.storage.set(collectionName, json);
  }

  getCollectionItem(collectionName){
    // get the specified collection
    return this.storage.get(collectionName).then((item) => {
      return JSON.parse(item);
    });
  }

  // TODO fai il delete per una collection

  // TODO fai il modify per una collection


}






