import { Component } from '@angular/core';

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

  constructor() {}


  public hideOverlay() {
    this.overlayHidden = true;
  }

  public askPermission(){
    // TODO Abdy inserisci qui la richiesta dei permessi
    console.log("Giving permissions")
  }
}
