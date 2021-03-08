import { Injectable } from '@angular/core';
import { CollectionItem } from '../shared/collectionItem';
import { Storage } from '@ionic/storage';
import firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})

// TODO fai nel database sezione per sole collezioni

export class CollectionItemService {
  public savedCollectionsListRef: string [];
  pathReference: any;
  imgs: []; // Title images downloaded from the firebase storage
  currentCoverImage: any;

  constructor(private storage: Storage) {

    /*// todo questo è da spostare i collections.page.ts
    this.getCollectionList().then(res => {
      this.savedCollectionsListRef = res;
      // todo iterare su tutte le collezioni estraendo le info necessarie avendo l'array di tutti i nomi di collezioni
      console.log("lista collezioni: ", this.savedCollectionsListRef)
    })*/

  }

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
  addCollectionItem(collectionName, recipeItemList){
    // key: collectionName (string), value: list of recipeItem objects
    // the list of recipeItem is first converted into a string
    let json = JSON.stringify(recipeItemList);
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

  }

  getCollectionItem(collectionName){
    // get the specified collection
    return this.storage.get(collectionName).then((item) => {
      return JSON.parse(item);
    });
  }

  deleteCollectionItem(collectionName){
    // delete an entire collection by collection name (e.g. "My Christmas Recipes")
    this.storage.remove(collectionName)

    // updating the list of collections
    this.storage.get("CollectionsList").then(valueStr => {
      let value = valueStr ? JSON.parse(valueStr) : {};

      // removing the item from the list
      //todo non funziona granché bene, non rimuove tutto
      value = value.filter(v => v !== collectionName);

      // Save the entire data again
      this.storage.set(collectionName, JSON.stringify(value));
    });
  }

  async addRecipeToCollectionItem(collectionName, recipe){
    // TODO gestire no duplicati di ricetta (controllare che recipe non sia già nella collectionName)

    // Get the entire data
    await this.storage.get(collectionName).then(async valueStr => {
      let value = valueStr ? JSON.parse(valueStr) : {};

      // if this is the first time we add a recipe to the collection, we take the first image of the collection
      // as cover photo
      if (value.recipeNumber == 0){
        value.coverPhoto = await this.getCoverImage(recipe).then(async res => {
          value.coverPhoto = res;
          return res;
        });
      }

      // pushing the new recipe
      value.recipeList.push(recipe);
      // updating the number of recipes
      value.recipeNumber = value.recipeList.length

      // Save the entire data again
      this.storage.set(collectionName, JSON.stringify(value));
    });
  }

  // Get cover image from recipe
  async getCoverImage(recipe): Promise<any> {

    const path = recipe.$key + "/" + recipe.$key + "_0.jpg";
    const urlSrc = await firebase.storage().ref().child(path).getDownloadURL().then(url => {
      return url;
    });
    return urlSrc;

  }

  deleteRecipeFromCollectionItem(collectionName, recipe){
    // TODO gestire no duplicati di ricetta (controllare che recipe non sia già nella collectionName)
    // TODO se nella collezione non ho più elementi devo valutare di resettare l'immagine di copertina
    // Get the entire data
    this.storage.get(collectionName).then(valueStr => {
      let value = valueStr ? JSON.parse(valueStr) : {};

      // checking that there is an item to delete
      value.recipeList = value.recipeList.filter(({ $key }) => $key !== recipe.$key);
      value.recipeNumber = value.recipeList.length

      // Save the entire data again
      this.storage.set(collectionName, JSON.stringify(value));
    });
  }
}
