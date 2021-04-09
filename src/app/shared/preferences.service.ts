import { Injectable } from '@angular/core';
import {Storage} from "@ionic/storage";
import {requiresInlineTypeCheckBlock} from "@angular/compiler-cli/src/ngtsc/typecheck/src/tcb_util";

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  constructor( private storage: Storage) { }


  async getAllergies(){
    return await this.storage.get("allergies");
  }

  async getDesiredFood(){
    return await this.storage.get("desiredFood");
  }

  async getUndesiredFood(){
    return await this.storage.get("undesiredFood");
  }


  async setPreferences(allergies, desiredFood, undesiredFood){
    await this.storage.set(`allergies`, allergies);
    await this.storage.set(`desiredFood`, desiredFood);
    await this.storage.set(`undesiredFood`, undesiredFood);
  }


}
