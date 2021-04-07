import {Component, Injectable, OnInit} from '@angular/core';
import {CollectionItemService} from "../shared/collection-item.service";
import {NavParams, PopoverController} from "@ionic/angular";

@Component({
  selector: 'app-popover-delete-collections',
  templateUrl: './popover-delete-collections.component.html',
  styleUrls: ['./popover-delete-collections.component.scss'],
})

@Injectable({ providedIn: 'root' })

export class PopoverDeleteCollectionsComponent implements OnInit {

  public navParams = new NavParams();
  collectionItem;

  constructor(
      private localDBService: CollectionItemService,
      public popoverController: PopoverController,
  ) {

    // retrieving data from the popover componentProps (the collectionItem the popover is opened on)
    this.collectionItem = this.navParams.get("collectionItem")

  }

  ngOnInit() {}

  async deleteCollection(){
    // deleting the collection from the local storage
    await this.localDBService.deleteCollectionItem(this.collectionItem.name)
    await this.popoverController.dismiss();
  }

}
