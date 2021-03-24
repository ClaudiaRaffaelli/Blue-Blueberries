import {Component, Injectable, OnInit} from '@angular/core';
import {CollectionItemService} from '../shared/collection-item.service';
import {NavParams} from "@ionic/angular";
import {CollectionItem} from "../shared/collectionItem";
import {Storage} from "@ionic/storage";


@Component({
  selector: 'app-popover-collections',
  templateUrl: './popover-collections.component.html',
  styleUrls: ['./popover-collections.component.scss'],
})
@Injectable({ providedIn: 'root' })

export class PopoverCollectionsComponent implements OnInit {

  collectionsNames = [];
  collectionsItems = [];
  favoritesCollection: CollectionItem;
  recipeInFavorites: boolean = false;
  recipeKey: string;
  public navParams = new NavParams();
  collectionNameFromInput: string;
  // array that for current recipe says if the recipe is in the collection (same order as collectionsItems)
  recipeInCollection: boolean [] = []

  constructor(
      private localDBService: CollectionItemService,
) {
    // retrieving data from the popover componentProps (recipe key from the recipe the popover is opened on)
    this.recipeKey = this.navParams.get("recipeKey")
    this.collectionNameFromInput = ""

    // getting the Favorites collection
    this.localDBService.getCollectionItem("Favorites").then(async res => {
      // if there is no Favorites collection, we create it
      if (res === null){
        this.favoritesCollection = await this.localDBService.createFavoritesCollection()
      }else{
        this.favoritesCollection = await res;
      }
      // set a boolean to know if the recipe is in the favorites this is used to show a different icon in the popup
      this.recipeInFavorites = await this.localDBService.isRecipeInCollection(this.favoritesCollection.name, this.recipeKey)
    });
  }

  ngOnInit() {
    this.collectionNameFromInput = ""
    this.localDBService.getCollectionList().then(async res => {
      this.collectionsNames = res;

      this.collectionsItems = [];
      // looping through all collections fetched, extracting them and adding them to the array
      for (let coll of res){
        this.localDBService.getCollectionItem(coll).then(item => {
          this.collectionsItems.push(item)
        })
        // for each collection set a boolean to know if the recipe is in the collection or not
        // this is used to show a different icon in the popup
        this.recipeInCollection.push(await this.localDBService.isRecipeInCollection(coll, this.recipeKey))

      }
    });

    // getting the Favorites collection
    this.localDBService.getCollectionItem("Favorites").then(async res => {
      this.favoritesCollection = await res;
      // set a boolean to know if the recipe is in the favorites this is used to show a different icon in the popup
      this.recipeInFavorites = await this.localDBService.isRecipeInCollection(res.name, this.recipeKey)
    });
  }

  async addRemoveToFromCollection(collectionItem, collectionIndex){
    // the recipeKey has already been set by opening the popover and is ready to be inserted or deleted from
    // the clicked collection (the entire collectionItem at input)

    if (this.recipeInCollection[collectionIndex] === false){
      // adding the recipe to the collection
      await this.localDBService.addRecipeToCollectionItem(collectionItem.name, this.recipeKey)
      // updating the icon by setting the recipe as added to the collection
      this.recipeInCollection[collectionIndex] = true;
    }else{
      // removing the recipe from the collection
      await this.localDBService.deleteRecipeFromCollectionItem(collectionItem.name, this.recipeKey)
      this.recipeInCollection[collectionIndex] = false;
    }

    /*this.localDBService.getCollectionItem(collectionItem.name).then(
        (item) => console.log(collectionItem.name, ': ', item)
    );*/
  }

  async eventHandlerInputText(){
    // detects enter event on the input text for adding a new collection

    // before adding the collection we check that the input of the user is not blank
    let checkString = this.collectionNameFromInput
    if (checkString.replace(/\s/g, '').length) {
      // removed all the whitespaces in the string and the length is still >0

      // adding the collection to the database and getting back the new item once inserted to be displayed
      // immediately on the opened popup
      this.collectionsItems.push(await this.localDBService.addCollectionItem(this.collectionNameFromInput))
      this.collectionNameFromInput = "";
      this.collectionsNames.push(this.collectionNameFromInput)
    }
  }

  async deleteCollection(collectionItem, collectionIndex){

    await this.localDBService.deleteCollectionItem(collectionItem.name).then(valueStr => {
      // removing the item name from the list of names
      this.collectionsNames = this.collectionsNames.filter(v => v !== collectionItem.name);
      this.collectionsItems.splice(collectionIndex, 1);
    });
  }

  async addDeleteFromFavorites(){
    // the recipeKey has already been set by opening the popover and is ready to be inserted or deleted from
    // the clicked collection (the entire collectionItem at input)

    if (this.recipeInFavorites === false){
      // adding the recipe to the collection
      await this.localDBService.addRecipeToCollectionItem("Favorites", this.recipeKey)
      // updating the icon by setting the recipe as added to the collection
      this.recipeInFavorites = true;
    }else{
      // removing the recipe from the collection
      await this.localDBService.deleteRecipeFromCollectionItem("Favorites", this.recipeKey)
      this.recipeInFavorites = false;
    }

/*    this.localDBService.getCollectionItem("Favorites").then(
      (item) => console.log("Favorites", ': ', item)
    );*/

  }

}
