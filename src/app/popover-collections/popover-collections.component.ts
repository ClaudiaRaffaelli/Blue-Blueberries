import {Component, Injectable, NgZone, OnInit} from '@angular/core';
import {CollectionItemService} from '../shared/collection-item.service';
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
  collectionNameFromInput: string;
  // array that for current recipe says if the recipe is in the collection (same order as collectionsItems)
  recipeInCollection: boolean [] = []

  constructor(
      private localDBService: CollectionItemService,
) {
    // retrieving data from the popover componentProps (recipe key from the recipe the popover is opened on)
    this.recipeKey = this.navParams.get("recipeKey")
    this.collectionNameFromInput = ""
  }

  // TODO ridimensiona la grandezza del popup

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
    })
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

      // TODO magari un'animazione per quando l'elemento è aggiunto in lista mostrata dal popup?
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

}
