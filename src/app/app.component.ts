import {Component, OnInit, ViewChild} from '@angular/core';
import {SpeechRecognition} from '@ionic-native/speech-recognition/ngx';
import {Storage} from "@ionic/storage";
import {Animation, AnimationController, Platform} from '@ionic/angular';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit{
    @ViewChild('slides', {static: true}) slides: IonSlides;
    overlayHidden: boolean = true;
    labelHidden = true;
    slideOpts = {
        initialSlide: 0,
        speed: 400,
        centeredSlides: true,
        loop: false,
        spaceBetween: 1,
    };

  constructor(private storage: Storage,
              private speechRecognition: SpeechRecognition,
              private animationCtrl: AnimationController,
              public platform: Platform) {
      this.overlayHidden = true;
  }

  async ngOnInit(){
      this.platform.ready().then(async () => {
          await this.slides.lockSwipes(true);
          // checking if it is the first time ever we open the app
          this.overlayHidden = ! await this.getIsFirstTime();
          if (this.overlayHidden === false){
              const animation: Animation = this.animationCtrl.create()
                  .addElement(document.getElementById("logo"))
                  .duration(400)
                  .fromTo('width', '75%', '100%')
                  .fromTo('opacity', '0.5', '1');

              await animation.play();
          }
      });
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
        await this.storage.set("FirstTime", JSON.stringify(false));
        return true;
      }else{
          //await this.storage.remove("FirstTime");
          return false;
      }
    });
  }

  async nextSlide() {
      this.labelHidden = false;
      await this.slides.lockSwipes(false);
      await this.slides.slideNext(200);
  }
}
