import {Component, Injectable, OnInit} from '@angular/core';
import {RecipeItemService} from '../shared/recipe-item.service';
import {CollectionItemService} from '../shared/collection-item.service';
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

  // TODO sistema pulsante per aggiunta alle collezioni: vuoto quando non è in nessuna collezione, pieno quando in almeno una
  // TODO sistema il routing all'interno delle collezioni personali: mancano i pulsanti per tornare indietro
  // TODO magari non un'immagine singola mostrata da fuori una collezione ma un collage
  ngOnInit() {


    // ---------- PARTE DI TESTING  ---------
    /*

      let collectionItem = new CollectionItem()
      collectionItem.recipeList = []
      collectionItem.recipeNumber = 0

      //collectionItem.name= "Pranzo da sola"
      //this.localDBService.addCollectionItem(collectionItem.name, collectionItem)

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






