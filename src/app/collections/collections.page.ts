import {Component, Injectable, OnInit} from '@angular/core';
//import {RecipeItem} from '../shared/recipeItem';
//import {CollectionItem} from '../shared/collectionItem';
import {RecipeItemService} from '../shared/recipe-item.service';
import {CollectionItemService} from '../shared/collection-item.service';
//import firebase from 'firebase';
import 'firebase/storage'; // in order to use images stored in the firebase database
import {NavigationExtras, Router} from '@angular/router'; // pass data between two pages
import {Storage} from '@ionic/storage';
import {PopoverCollectionsComponent} from "../popover-collections/popover-collections.component";

@Component({
  selector: 'app-collections',
  templateUrl: './collections.page.html',
  styleUrls: ['./collections.page.scss'],
})

@Injectable({ providedIn: 'root' })

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
      private storage: Storage,
      private popoverComponent: PopoverCollectionsComponent,
  ) {
    // making sure that local storage is ready
    storage.ready().then(() => {
    });


  }

  ngOnInit() {


    // ---------- PARTE DI TESTING  ---------
    /*

    this.fetchRecipeItems();
    const recipesRes = this.aptService.getRecipesList();
    recipesRes.snapshotChanges().subscribe(res => {
      this.recipes = [];
      res.forEach(item => {
        const myRecipeItem = item.payload.toJSON();

        // TODO testing di aggiunta ricetta singola
        // TODO d'ora in poi non salviamo tutta la ricetta dentro ma solo la sua key
        // saving locally only the key of the recipe and not the whole data
        //this.localDBService.addRecipeToCollectionItem("Pranzo da sola", item.key)
        // aggiungo cheesecake esplicitamente
        //this.localDBService.addRecipeToCollectionItem("Pranzo da sola","192b5b1614930271726" )
        //this.localDBService.addRecipeToCollectionItem("Le mie cene romantiche", item.key)
        //this.deleteRecipeFromCollectionItem("CollezioneA", myRecipeItem)

      });

      // TODO some testing
      let collectionItem = new CollectionItem()
      collectionItem.recipeList = []
      collectionItem.recipeNumber = 0

      //collectionItem.name= "Pranzo da sola"
      //this.localDBService.addCollectionItem(collectionItem.name, collectionItem)
      //collectionItem.name= "Le mie cene romantiche"
      //this.localDBService.addCollectionItem(collectionItem.name, collectionItem)
      //this.localDBService.deleteCollectionItem("CollezioneD")

      this.localDBService.getCollectionItem("MiaCollezione").then(
          (item) => console.log('Il contenuto della collezione Mia è ', item)
      );
      this.localDBService.getCollectionItem("CollezioneA").then(
          (item) => console.log('Il contenuto della collezione A è ', item)
      );
      this.localDBService.getCollectionItem("CollezioneB").then(
          (item) => console.log('Il contenuto della collezione B è ', item)
      );
      this.localDBService.getCollectionItem("CollezioneC").then(
          (item) => console.log('Il contenuto della collezione C è ', item)
      );
      this.localDBService.getCollectionItem("CollezioneD").then(
          (item) => console.log('Il contenuto della collezione D è ', item)
      );
      this.localDBService.getCollectionItem("CollezioneE").then(
          (item) => console.log('Il contenuto della collezione E è ', item)
      );
    });*/

  }


  ionViewWillEnter(){
    console.log("Re-loading collection each time I enter")
    this.localDBService.getCollectionList().then(res => {
      this.savedCollectionsListRef = res;

      //console.log("lista collezioni: ", this.savedCollectionsListRef)
      this.collections = [];
      // looping through all collections fetched
      for (let coll of res){
        this.localDBService.getCollectionItem(coll).then(item => {
          this.collections.push(item)
        })
      }
    })
  }

  openCollection(collectionP: any){
    const navigationExtras: NavigationExtras = {
      state: {
        collection: collectionP
      }
    };
    this.router.navigate(['view-collection'], navigationExtras);
  }

  fetchRecipeItems() {
    this.aptService.getRecipesList().valueChanges().subscribe(res => {
    });
  }

}






