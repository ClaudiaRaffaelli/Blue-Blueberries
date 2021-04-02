import { Component } from '@angular/core';
import {SpeechRecognition} from '@ionic-native/speech-recognition/ngx';
import {Storage} from "@ionic/storage";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  overlayHidden: boolean = false;
  slideOpts = {
    initialSlide: 0,
    speed: 400
  };

  constructor(private storage: Storage,
              private speechRecognition: SpeechRecognition) {}



  public hideOverlay() {
    this.overlayHidden = true;
  }

  public askPermission(){
    // Check feature available
    this.speechRecognition.isRecognitionAvailable()
        .then((available: boolean) => {
          if (available){
            this.speechRecognition.hasPermission()
                .then((hasPermission: boolean) => {
                  if (!hasPermission){
                    // Request permissions
                    this.speechRecognition.requestPermission();
                  }
                });
          }
        });
    console.log('Giving permissions');
  }


  /*getGroceryList(){
    // getting the array of recipe key in the grocery list
    return this.storage.get("GroceryList").then((item) => {
      // If this is the first time we are fetching the grocery there is also no grocery list and we create it
      if (item == undefined){
        this.storage.set("GroceryList", JSON.stringify([]));
      }
      return JSON.parse(item);
    });
  }*/
}
