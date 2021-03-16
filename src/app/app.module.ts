import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

//  firebase imports, remove what you don't require
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { PopoverCollectionsComponent } from './popover-collections/popover-collections.component';
// local storage imports
import { IonicStorageModule } from '@ionic/storage';

// environment
import { environment } from '../environments/environment';
import {FormsModule} from '@angular/forms';
import { SpeechRecognition } from '@ionic-native/speech-recognition/ngx';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';


@NgModule({
    declarations: [AppComponent, PopoverCollectionsComponent],
    entryComponents: [PopoverCollectionsComponent],
    imports: [BrowserModule, IonicModule.forRoot(), IonicStorageModule.forRoot(), AppRoutingModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFireAuthModule,
        AngularFireDatabaseModule,
        AngularFireStorageModule, FormsModule],
    providers: [SpeechRecognition, TextToSpeech, {provide: RouteReuseStrategy, useClass: IonicRouteStrategy}],
    bootstrap: [AppComponent],
    exports: [
        PopoverCollectionsComponent
    ]
})
export class AppModule {}

