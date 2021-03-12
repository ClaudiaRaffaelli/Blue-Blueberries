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
  collectionNameFromInput: string;

  constructor(
      private localDBService: CollectionItemService,
  ) {
    // retrieving data from the popover componentProps (recipe key from the recipe the popover is opened on)
    this.recipeKey = this.navParams.get("recipeKey")
    this.collectionNameFromInput = ""
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
    /*
    await this.localDBService.deleteCollectionItem("My romantic dinners")
    await this.localDBService.deleteCollectionItem("Nights alone")
    await this.localDBService.deleteCollectionItem("My favorite desserts")*/

    /*this.localDBService.getCollectionItem(collectionItem.name).then(
        (item) => console.log(collectionItem.name, ': ', item)
    );*/
  }

  async eventHandlerInputText(){
    // detects enter event on the input text for adding a new collection
    console.log("prima", this.collectionsNames)
    // before adding the collection we check that the input of the user is not blank
    let checkString = this.collectionNameFromInput
    if (checkString.replace(/\s/g, '').length) {
      // removed all the whitespaces in the string and the length is still >0
      await this.localDBService.addCollectionItem(this.collectionNameFromInput);

      // TODO update the popup to show the new added collection immediately
      //this.collectionsNames.push(this.collectionNameFromInput);
      //console.log("dopo", this.collectionsNames)
      //(this.collectionsNames as any).push(this.collectionNameFromInput);
    }

  }

}
