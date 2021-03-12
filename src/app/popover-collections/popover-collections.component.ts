import {Component, Injectable, OnInit} from '@angular/core';
import {CollectionItemService} from '../shared/collection-item.service';
import {RecipeItemService} from "../shared/recipe-item.service";
import firebase from "firebase";
import {NavParams} from "@ionic/angular";

@Component({
  selector: 'app-popover-collections',
  templateUrl: './popover-collections.component.html',
  styleUrls: ['./popover-collections.component.scss'],
})
@Injectable({ providedIn: 'root' })

export class PopoverCollectionsComponent implements OnInit {

  collectionsNames = [];
  collectionsItems = [];
  recipeKey: string;
  public navParams = new NavParams();

  constructor(
      private localDBService: CollectionItemService,
  ) {
    // retrieving data from the popover componentProps (recipe key from the recipe the popover is opened on)
    this.recipeKey = this.navParams.get("recipeKey")
  }

  ngOnInit() {
    // TODO per aggiornare le collezioni fare stessa cosa in collections ad ogni refresh
    this.localDBService.getCollectionList().then(res => {
      this.collectionsNames = res;
      //console.log("primo scan lista collezioni: ", this.collectionsNames)

      this.collectionsItems = [];
      // looping through all collections fetched, extracting them and adding them to the array
      for (let coll of res){
        this.localDBService.getCollectionItem(coll).then(item => {
          this.collectionsItems.push(item)
        })
      }
    })

  }

  async addToCollection(collectionItem){
    // the recipeKey has already been set by opening the popover and is ready to be inserted into
    // the clicked collection (the entire collectionItem at input)

    //console.log(collectionItem.name)

    await this.localDBService.addRecipeToCollectionItem(collectionItem.name, this.recipeKey)


    /*this.localDBService.getCollectionItem(collectionItem.name).then(
        (item) => console.log(collectionItem.name, ': ', item)
    );*/
    /*await this.localDBService.deleteCollectionItem("CollezioneD")
    await this.localDBService.deleteCollectionItem("CollezioneB")
    await this.localDBService.deleteCollectionItem("CollezioneE")
    await this.localDBService.deleteCollectionItem("My romantic dinners")
    await this.localDBService.deleteCollectionItem("Nights alone")
    await this.localDBService.deleteCollectionItem("My favorite desserts")*/

    //await this.localDBService.addCollectionItem("My romantic dinners")
    //await this.localDBService.addCollectionItem("Nights alone")
    //await this.localDBService.addCollectionItem("My favorite desserts")



    //collectionItem.name= "Pranzo da sola"
    //this.localDBService.addCollectionItem(collectionItem.name, collectionItem)

    /*this.localDBService.addRecipeToCollectionItem(collectionItem,"192b5b1614930271726" )*/

    /*this.localDBService.getCollectionItem(collectionItem.name).then(
        (item) => console.log(collectionItem.name, ': ', item)
    );*/
  }



}
