import { Component, OnInit } from '@angular/core';
import {NavigationExtras, Router} from '@angular/router';
import {Storage} from '@ionic/storage';
import {IngredientsDic} from '../shared/recipeItem';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.page.html',
  styleUrls: ['./preferences.page.scss'],
})
export class PreferencesPage implements OnInit {
  ingredientsDic: IngredientsDic;
  undesiredDic;
  allergies: [];
  undesiredFood = [];
  desiredFood = [];
  unsavedChanges: boolean; // flag;

  constructor(private router: Router, public storage: Storage) {
    this.ingredientsDic = new IngredientsDic();
    this.undesiredDic = new IngredientsDic().ingredients;
  }


  async ionViewWillEnter(){
    this.unsavedChanges = false;
    // making sure that local storage is ready
    this.storage.ready().then(async () => {
      this.allergies = await this.storage.get(`allergies`);
      this.desiredFood = await this.storage.get(`desiredFood`);
      this.undesiredFood = await this.storage.get(`undesiredFood`);
    });
  }
  ngOnInit() {
  }

  toggleAllergies(e){
    this.unsavedChanges = true;
    this.allergies = e.target.value;
  }

  toggleUndesiredFood(e){
    this.unsavedChanges = true;
    this.undesiredFood = e.target.value;
  }

  toggleDesiredFood(e){
    this.unsavedChanges = true;
    this.desiredFood = e.target.value;
  }

  public submit(){
    this.unsavedChanges = false;
    this.storage.set(`allergies`, this.allergies);
    this.storage.set(`desiredFood`, this.desiredFood);
    this.storage.set(`undesiredFood`, this.undesiredFood);
  }

}
