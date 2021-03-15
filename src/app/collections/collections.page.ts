import {Component, Injectable, OnInit} from '@angular/core';
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

// TODO cuore nella pagina della ricetta nella parte di fianco al timer


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
  ) {
    // making sure that local storage is ready
    storage.ready().then(() => {
    });

  }

  // TODO sistema pulsante per aggiunta alle collezioni: vuoto quando non è in nessuna collezione, pieno quando in almeno una
  // TODO sistema il routing all'interno delle collezioni personali: mancano i pulsanti per tornare indietro
  // TODO magari non un'immagine singola mostrata da fuori una collezione ma un collage
  // TODO controlla che quando elimino una ricetta l'immagine di copertina non sia l'immagine della ricetta rimossa
  ngOnInit() {

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
        collection: collectionP,
        isCollection: true
      }
    };
    this.router.navigate(['home'], navigationExtras);
  }

  fetchRecipeItems() {
    this.aptService.getRecipesList().valueChanges().subscribe(res => {
    });
  }

  async deleteCollection(collectionItem, collectionIndex){
    // deleting the collection from the local storage
    await this.localDBService.deleteCollectionItem(collectionItem.name).then(valueStr => {
      // removing the collection from the saved list
      this.collections.splice(collectionIndex, 1);
    });
  }

}
