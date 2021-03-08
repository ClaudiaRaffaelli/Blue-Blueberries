import {Component, OnInit} from '@angular/core';
import {RecipeItemService} from '../shared/recipe-item.service';
import {CollectionItemService} from '../shared/collection-item.service';
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

  savedCollectionsListRef = [];

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

    this.localDBService.getCollectionList().then(res => {
      this.savedCollectionsListRef = res;
      // todo iterare su tutte le collezioni estraendo le info necessarie avendo l'array di tutti i nomi di collezioni
      console.log("lista collezioni: ", this.savedCollectionsListRef)

      this.collections = [];
      // looping through all collections fetched
      for (let coll of res){
        this.localDBService.getCollectionItem(coll).then(item => {
          this.collections.push(item)
        })
      }
    })
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

}






