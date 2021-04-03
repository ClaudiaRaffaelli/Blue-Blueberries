import {Component, OnInit} from '@angular/core';
import {SpeechRecognition} from '@ionic-native/speech-recognition/ngx';
import {Storage} from "@ionic/storage";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{

  overlayHidden: boolean = true;
  slideOpts = {
    initialSlide: 0,
    speed: 400,
    centeredSlides: true,
    loop: false,
    spaceBetween: 1,
  };

  constructor(private storage: Storage,
              private speechRecognition: SpeechRecognition) {
      // checking if it is the first time ever we open the app
      this.overlayHidden = ! this.getIsFirstTime();
      console.log(this.overlayHidden);
  }

  async ngOnInit(){
  }



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


  async getIsFirstTime(){
    // getting a value to know if it is the first time that the user has entered the application or not
    return this.storage.get("FirstTime").then(async (item) => {
      // If this is the first time we enter there is no value stored, we insert it as false (since we have entered)
      if (item == undefined){
        this.storage.set("FirstTime", JSON.stringify(false));
        return true;
      }else{
          return false;
      }
    });
  }
}
