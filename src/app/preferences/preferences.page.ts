import { Component, OnInit } from '@angular/core';
import {NavigationExtras, Router} from '@angular/router';
import {Storage} from '@ionic/storage';
import {IngredientsDic} from '../shared/recipeItem';
import {Platform} from "@ionic/angular";
import {PreferencesService} from "../shared/preferences.service";


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

  constructor(public storage: Storage,
              private platform: Platform,
              private router: Router,
              private preferencesDBService: PreferencesService) {
    this.ingredientsDic = new IngredientsDic();
    this.undesiredDic = new IngredientsDic().ingredients;
  }


  async ionViewWillEnter(){
    this.unsavedChanges = false;
    // making sure that local storage is ready
    this.storage.ready().then(async () => {
      this.allergies = await this.preferencesDBService.getAllergies();
      this.desiredFood = await this.preferencesDBService.getDesiredFood();
      this.undesiredFood = await this.preferencesDBService.getUndesiredFood();
    });
  }

  ionViewDidLeave(){
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigate(['preferences']);
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

  public async submit(){
    this.unsavedChanges = false;
    await this.preferencesDBService.setPreferences(this.allergies, this.desiredFood, this.undesiredFood);
  }

}
