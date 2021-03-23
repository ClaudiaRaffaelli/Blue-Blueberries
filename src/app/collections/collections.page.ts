import {Component, Injectable, OnInit} from '@angular/core';
import {CollectionItemService} from '../shared/collection-item.service';
import 'firebase/storage'; // in order to use images stored in the firebase database
import {NavigationExtras, Router} from '@angular/router'; // pass data between two pages
import {Storage} from '@ionic/storage';

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
      private router: Router,
      private storage: Storage,
  ) {
    // making sure that local storage is ready
    storage.ready().then(() => {
    });

  }

  // TODO magari fare le collezioni più larghe, a causa dello slider sono molto compresse in width

  ngOnInit() {

  }

  ionViewWillEnter(){
    console.log("Re-loading collection each time I enter")
    this.localDBService.getCollectionList().then(res => {
      this.savedCollectionsListRef = res;

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
        lastPage: 'collections'
      }
    };
    this.router.navigate(['home'], navigationExtras);
  }

  async deleteCollection(collectionItem, collectionIndex){
    // deleting the collection from the local storage
    await this.localDBService.deleteCollectionItem(collectionItem.name).then(valueStr => {
      // removing the collection from the saved list
      this.collections.splice(collectionIndex, 1);
    });
  }

}
