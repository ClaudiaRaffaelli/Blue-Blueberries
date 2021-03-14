import { Injectable } from '@angular/core';
import { CollectionItem } from '../shared/collectionItem';
import { Storage } from '@ionic/storage';
import firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})

// TODO fai nel database sezione per sole collezioni

export class CollectionItemService {
  savedCollectionsListRef: [];
  pathReference: any;
  imgs: []; // Title images downloaded from the firebase storage
  currentCoverImage: any;
  collections: [];

  constructor(private storage: Storage) {}

  getCollectionList(){
    // getting the array of collections
    return this.storage.get("CollectionsList").then((item) => {
      // If this is the first time we are fetching collections there is also no collections list and we create it
      if (item == undefined){
        this.storage.set("CollectionsList", JSON.stringify([]));
      }
      return JSON.parse(item);
    });
  }

  // Local storage methods for handling personalized collections
  addCollectionItem(collectionName){

    let collectionItem = new CollectionItem()
    collectionItem.recipeList = [];
    collectionItem.recipeNumber = 0;
    collectionItem.name = collectionName;

    // todo numero massimo di collezioni creabili
    // key: collectionName (string), value: the collectionItem object
    // the collectionItem is empty and with no recipe, and it is first converted into a string
    let json = JSON.stringify(collectionItem);
    this.storage.set(collectionName, json);

    // updating the list of collections
    this.storage.get("CollectionsList").then(valueStr => {
      let value = valueStr ? JSON.parse(valueStr) : {};

      // pushing the new collection if not already present
      if (! value.includes(collectionName)) {
        value.push(collectionName);
      }

      // Save the entire data again
      this.storage.set("CollectionsList", JSON.stringify(value));
    });

    return collectionItem;
  }

  getCollectionItem(collectionName){
    // get the specified collection
    return this.storage.get(collectionName).then((item) => {
      return JSON.parse(item);
    });
  }

  async deleteCollectionItem(collectionName){
    // delete an entire collection by collection name (e.g. "My Christmas Recipes")
    await this.storage.remove(collectionName)

    // updating the list of collections
    await this.storage.get("CollectionsList").then(valueStr => {
      let value = valueStr ? JSON.parse(valueStr) : {};

      // removing the item from the list
      value = value.filter(v => v !== collectionName);
      console.log("value:", value)

      // Save the entire data again
      this.storage.set("CollectionsList", JSON.stringify(value));
    });
  }

  async addRecipeToCollectionItem(collectionName, recipeKey){
    // TODO gestire no duplicati di ricetta (controllare che recipe non sia già nella collectionName)

    // Get the entire data
    await this.storage.get(collectionName).then(async valueStr => {
      let value = valueStr ? JSON.parse(valueStr) : {};

      // if this is the first time we add a recipe to the collection, we take the first image of the collection
      // as cover photo
      if (value.recipeNumber == 0){
        value.coverPhoto = await this.getCoverImage(recipeKey).then(async res => {
          value.coverPhoto = res;
          return res;
        });
      }
      // pushing the new recipe key
      value.recipeList.push(recipeKey);
      // updating the number of recipes
      value.recipeNumber = value.recipeList.length

      // Save the entire data again
      this.storage.set(collectionName, JSON.stringify(value));
    });
  }

  // Get cover image from recipe
  async getCoverImage(recipeKey): Promise<any> {

    const path = recipeKey + "/" + recipeKey + "_0.jpg";
    const urlSrc = await firebase.storage().ref().child(path).getDownloadURL().then(url => {
      return url;
    });
    return urlSrc;

  }

  deleteRecipeFromCollectionItem(collectionName, recipeKey){
    // TODO se nella collezione non ho più elementi devo valutare di resettare l'immagine di copertina
    // Get the entire data
    this.storage.get(collectionName).then( valueStr => {
      let value = valueStr ? JSON.parse(valueStr) : {};

      // checking that there is an item to delete
      value.recipeList = value.recipeList.filter($key => $key.toString() !== recipeKey);
      value.recipeNumber = value.recipeList.length

      // Save the entire data again
      this.storage.set(collectionName, JSON.stringify(value));
    });
  }

  isRecipeInCollection(collectionName, recipeKey){
    // Get the entire data
    return this.storage.get(collectionName).then(valueStr => {
      let value = valueStr ? JSON.parse(valueStr) : {};

      // if recipeList includes the key returns true, otherwise false
      return !!value.recipeList.includes(recipeKey);
    });
  }
}
