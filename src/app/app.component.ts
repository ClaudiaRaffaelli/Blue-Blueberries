import { Component } from '@angular/core';
import {SpeechRecognition} from '@ionic-native/speech-recognition/ngx';

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

  constructor(private speechRecognition: SpeechRecognition) {}


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
}
