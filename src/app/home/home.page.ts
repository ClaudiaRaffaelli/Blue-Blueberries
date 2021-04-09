import {Component, OnInit} from '@angular/core';
import {IngredientsDic, RecipeItem} from '../shared/recipeItem';
import { RecipeItemService } from './../shared/recipe-item.service';
import firebase from 'firebase';
import 'firebase/storage'; // in order to use images stored in the firebase database
import {Router, NavigationExtras, ActivatedRoute} from '@angular/router'; // pass data between two pages
import {PopoverController} from '@ionic/angular';
import {PopoverCollectionsComponent} from '../popover-collections/popover-collections.component';
import {CollectionItemService} from '../shared/collection-item.service';
import {Storage} from '@ionic/storage';
import { Platform } from '@ionic/angular';
import {PreferencesService} from "../shared/preferences.service";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {
  lastPage = '';
  recipes = []; // Here are going to be saved all the recipes downloaded from the database
  pathReference: any;
  imgs: []; // Title images downloaded from the firebase storage
  recipesRes: any;
  query = {}; // query from search-page
  dataFetched: boolean; // flag that indicates when all recipes data have been downloaded from the database
  collection: any; // collection got from custom collection page
  titlePage = '';
  isInAnyCollection = [];
  allergies: [];
  desiredFood: [];
  undesiredFood: [];
  noRecipe = true;

  constructor(
    private aptService: RecipeItemService,
    private route: ActivatedRoute,
    private router: Router,
    private localDBService: CollectionItemService,
    public popoverController: PopoverController,
    public storage: Storage,
    private platform: Platform,
    private preferencesDBService: PreferencesService
  ) {
    this.route.queryParams.subscribe(async params => {
    if (this.router.getCurrentNavigation().extras.state) {
      this.noRecipe = true;
      this.query = this.router.getCurrentNavigation().extras.state.query;
      this.lastPage = this.router.getCurrentNavigation().extras.state.lastPage;

      // If we are navigating from the page where there are listed all the collection.
      // in this page are shown all the recipes from that collection
      if (this.lastPage === 'collections' || this.lastPage === 'presentation'){
        this.recipes = [];
        this.collection = this.router.getCurrentNavigation().extras.state.collection;
        this.titlePage = this.collection.name;

        const database = firebase.database().ref();
        for (const recipeKey of this.collection.recipeList){

          const myRecipeItem = await database.child('recipes').child(recipeKey).get().then(function(snapshot) {
            if (snapshot.exists()) {
              // tslint:disable-next-line:no-shadowed-variable
              const myRecipeItem = snapshot.val();
              // @ts-ignore
              myRecipeItem.$key = recipeKey;
              return myRecipeItem;
            }
            else {
              console.log('No data available');
            }
          }).catch(function(error) {
            console.error(error);
          });

          // get title image
          this.pathReference = firebase.storage().ref().child(recipeKey + '/' + recipeKey + '_0.jpg').getDownloadURL().then(url => {
            this.imgs = url;
            // @ts-ignore
            myRecipeItem.title_image = this.imgs;
          });
          this.allergies = await this.storage.get(`allergies`);
          this.undesiredFood = await this.storage.get(`undesiredFood`);
          this.desiredFood = await this.storage.get(`desiredFood`);
          this.checkQuery(myRecipeItem);
        }
        this.dataFetched = true;
      } else{
        // navigating here from the search page
        this.allergies = await this.preferencesDBService.getAllergies();
        this.desiredFood = await this.preferencesDBService.getDesiredFood();
        this.undesiredFood = await this.preferencesDBService.getUndesiredFood();

        this.titlePage = '';
        this.recipesRes = this.aptService.getRecipesList();
        this.recipesRes.snapshotChanges().subscribe(res => {
          this.dataFetched = false;
          this.recipes = [];
          res.forEach(item => {
            const myRecipeItem = item.payload.toJSON();
            // @ts-ignore
            myRecipeItem.$key = item.key;
            // get title image
            this.pathReference = firebase.storage().ref().child(item.key + '/' + item.key + '_0.jpg').getDownloadURL().then(url => {
              this.imgs = url;
              // @ts-ignore
              myRecipeItem.title_image = this.imgs;
            });


            // *** Check query ***
            this.checkQuery(myRecipeItem);
          });
          this.dataFetched = true;
        });
      }
    }
  });
  }



  ionViewWillEnter(){
    // updating isInAnyCollection to display a different heart icon (full or empty) if the recipe is in any collection
    // or not
    this.reloadIsInCollection();
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.router.navigate([this.lastPage]);
    });
  }

  async reloadIsInCollection(){
    this.isInAnyCollection = [];
    for(let recipe of this.recipes){
      await this.localDBService.isRecipeInAnyCollection(recipe.$key).then(res =>{
        this.isInAnyCollection.push(res);
      })
    }
  }


  ngOnInit() {
  }


  async presentPopover(eve: any, recipeKey: string, recipeIndex) {
    const popover = await this.popoverController.create({
      component: PopoverCollectionsComponent,
      cssClass: 'popOver',
      componentProps: {
        // communicating the recipe key to the popover for when the recipe will be added to the collection
        recipeKey: recipeKey,
      },
      event: eve,
      mode: 'ios',
      translucent: true
    });

    popover.onWillDismiss().then(() => {
          // alert("before dismissing the popover")
    });
    popover.onDidDismiss().then(async () => {
      // when the popover is dismissed we see if we have to change the status of the heart icon
      this.isInAnyCollection[recipeIndex] = await this.localDBService.isRecipeInAnyCollection(recipeKey);
    });
    return await popover.present();
  }


  openRecipe(recipeP: any){
    const navigationExtras: NavigationExtras = {
      state: {
        recipe: recipeP,
        lastPage: 'home'
      }
    };
    this.router.navigate(['view-recipe'], navigationExtras);

  }

  fetchRecipeItems() {
    this.aptService.getRecipesList().valueChanges().subscribe(res => {
    });
  }

  deleteRecipeItem(id) {
    if (window.confirm('Do you really want to delete?')) {
      this.aptService.deleteRecipe(id);
    }
  }

  checkQuery(myRecipeItem){
    let numberOfFilters = 0;
    if (this.lastPage === 'search-recipe') {
      numberOfFilters = Object.keys(this.query).length; // get the number of queries
    }
    if (this.allergies.length > 0) numberOfFilters++;
    if (this.desiredFood.length > 0) numberOfFilters++;
    if (this.undesiredFood.length > 0) numberOfFilters++;
    if (numberOfFilters === 0){ // no filters applied
      this.recipes.push(myRecipeItem as RecipeItem);
      this.noRecipe = false;
    }else if (this.lastPage === 'collections' || this.lastPage === 'presentation') {
      let filtersSatisfied = true;
      if (this.allergies.length > 0 && (filtersSatisfied === true)){
        let filterOk = true;
        for (const recipeAllergy in myRecipeItem.allergies){
          for (let i = 0; i < this.allergies.length; i++){
            // @ts-ignore
            if (this.allergies[i] === myRecipeItem.allergies[recipeAllergy]){
              filterOk = false;
              filtersSatisfied = false;
              break;
            }
          }
        }
        if (filterOk){
          if (--numberOfFilters === 0) {
            this.recipes.push(myRecipeItem as RecipeItem);
            this.noRecipe = false;
          }
        }else{
          filtersSatisfied = false;
        }
      }
      // @ts-ignore
      if (this.desiredFood.length > 0 && (filtersSatisfied === true)) {
        let filterOk = false;
        try{ // old recipes does not have user preferences
          for (const recipeDesiredFood in myRecipeItem.desiredFood) {
            for (let i = 0; i < this.desiredFood.length; i++) {
              // @ts-ignore
              if (this.desiredFood[i] === myRecipeItem.desiredFood[recipeDesiredFood]) {
                filterOk = true;
                break;
              }
            }
          }
        }catch (e){}
        finally {
          if (filterOk){
            if (--numberOfFilters === 0) {
              this.recipes.push(myRecipeItem as RecipeItem);
              this.noRecipe = false;
            }
          }else{
            filtersSatisfied = false;
          }
        }
      }
      // @ts-ignore
      if (this.undesiredFood.length > 0 && (filtersSatisfied === true)) {
        let filterOk = true;
        try {
          for (const ingredient in myRecipeItem.ingredients) {
            for (let i = 0; i < this.undesiredFood.length; i++) {
              // @ts-ignore
              if (myRecipeItem.ingredients[this.undesiredFood[i]].selected) {
                filterOk = false;
                filtersSatisfied = false;
                break;
              }
            }
          }
        }catch (e){}
        if (filterOk){
          if (--numberOfFilters === 0) {
            this.recipes.push(myRecipeItem as RecipeItem);
            this.noRecipe = false;
          }
        }else{
          filtersSatisfied = false;
        }
      }
    }
    else{
      // filtersSatisfied true means no filter has been checked or each filter is satisfied by now. If a filter is not satisfied then
      // filtersSatisfied is changed to false in order to save computational time because the next filters are not going to be checked
      let filtersSatisfied = true;
      // Check queries one by one
      // @ts-ignore
      if (this.query.collections && (filtersSatisfied === true)){
        // @ts-ignore
        if (this.query.collections.includes(myRecipeItem.collections as RecipeItem)){
          if (--numberOfFilters === 0) {
            this.recipes.push(myRecipeItem as RecipeItem);
            this.noRecipe = false;
          }
        }else{
          filtersSatisfied = false;
        }
      }
      // @ts-ignore
      if (this.query.recipeName && (filtersSatisfied === true)){
        // @ts-ignore
        if (myRecipeItem.name.toLowerCase().indexOf(this.query.recipeName.toLowerCase()) !== -1){
          if (--numberOfFilters === 0) {
            this.recipes.push(myRecipeItem as RecipeItem);
            this.noRecipe = false;
          }
        }else{
          filtersSatisfied = false;
        }
      }
      // @ts-ignore
      if (this.query.difficulty && (filtersSatisfied === true)){
        // @ts-ignore
        if ((myRecipeItem.recipeDifficulty.toLowerCase() as RecipeItem) === this.query.difficulty.toLowerCase()) {
          if (--numberOfFilters === 0) {
            this.recipes.push(myRecipeItem as RecipeItem);
            this.noRecipe = false;
          }
        }else{
          filtersSatisfied = false;
        }
      }
      // @ts-ignore
      if (this.query.requiredTime && (filtersSatisfied === true)){
        // @ts-ignore
        if ((myRecipeItem.recipeTime as RecipeItem) <= this.query.requiredTime) {
          if (--numberOfFilters === 0) {
            this.recipes.push(myRecipeItem as RecipeItem);
            this.noRecipe = false;
          }
        }else{
          filtersSatisfied = false;
        }
      }
      // @ts-ignore
      if (this.query.specificDesiredFood && (filtersSatisfied === true)){
        let filterOk = false;
        try{ // old recipes does not have user preferences
          for (const recipeDesiredFood in myRecipeItem.desiredFood) {
            // @ts-ignore
            if (this.query.specificDesiredFood === myRecipeItem.desiredFood[recipeDesiredFood]) {
              filterOk = true;
              break;
            }
          }
        }catch (e){}
        finally {
          if (filterOk){
            if (--numberOfFilters === 0) {
              this.recipes.push(myRecipeItem as RecipeItem);
              this.noRecipe = false;
            }
          }else{
            filtersSatisfied = false;
          }
        }
      }
      if (this.allergies.length > 0 && (filtersSatisfied === true)){
        let filterOk = true;
        for (const recipeAllergy in myRecipeItem.allergies){
          for (let i = 0; i < this.allergies.length; i++){
            // @ts-ignore
            if (this.allergies[i] === myRecipeItem.allergies[recipeAllergy]){
              filterOk = false;
              filtersSatisfied = false;
              break;
            }
          }
        }
        if (filterOk){
          if (--numberOfFilters === 0) {
            this.recipes.push(myRecipeItem as RecipeItem);
            this.noRecipe = false;
          }
        }else{
          filtersSatisfied = false;
        }
      }
      // @ts-ignore
      if (this.desiredFood.length > 0 && (filtersSatisfied === true)) {
        let filterOk = false;
        try{ // old recipes does not have user preferences
          for (const recipeDesiredFood in myRecipeItem.desiredFood) {
            for (let i = 0; i < this.desiredFood.length; i++) {
              // @ts-ignore
              if (this.desiredFood[i] === myRecipeItem.desiredFood[recipeDesiredFood]) {
                filterOk = true;
                break;
              }
            }
          }
        }catch (e){}
        finally {
          if (filterOk){
            if (--numberOfFilters === 0) {
              this.recipes.push(myRecipeItem as RecipeItem);
              this.noRecipe = false;
            }
          }else{
            filtersSatisfied = false;
          }
        }
      }
      // @ts-ignore
      if (this.undesiredFood.length > 0 && (filtersSatisfied === true)) {
        let filterOk = true;
        try {
          for (const ingredient in myRecipeItem.ingredients) {
            for (let i = 0; i < this.undesiredFood.length; i++) {
              // @ts-ignore
              if (myRecipeItem.ingredients[this.undesiredFood[i]].selected) {
                filterOk = false;
                filtersSatisfied = false;
                break;
              }
            }
          }
        }catch (e){}
        if (filterOk){
          if (--numberOfFilters === 0) {
            this.recipes.push(myRecipeItem as RecipeItem);
            this.noRecipe = false;
          }
        }else{
          filtersSatisfied = false;
        }
      }
      // @ts-ignore
      if (this.query.availableIngredients && (filtersSatisfied === true)){
        let filterOk = true;
        for (const ingredient in myRecipeItem.ingredients){
          // @ts-ignore
          if (myRecipeItem.ingredients[ingredient].selected && !this.query.availableIngredients[ingredient].selected){
            filterOk = false;
            filtersSatisfied = false;
            break;
          }
        }
        if (filterOk){
          if (--numberOfFilters === 0) {
            this.recipes.push(myRecipeItem as RecipeItem);
            this.noRecipe = false;
          }
        }else{
          filtersSatisfied = false;
        }
      }
      // @ts-ignore
      if (this.query.mainIngredients && (filtersSatisfied === true)){
        let filterOk = false;
        for (const ingredient in myRecipeItem.ingredients){
          // @ts-ignore
          if (myRecipeItem.ingredients[ingredient].selected && this.query.mainIngredients[ingredient].selected){
            filterOk = true;
            break;
          }
        }
        if (filterOk){
          if (--numberOfFilters === 0) {
            this.recipes.push(myRecipeItem as RecipeItem);
            this.noRecipe = false;
          }
        }else{
          filtersSatisfied = false;
        }
      }
      // @ts-ignore
      if (this.query.undesiredIngredients && (filtersSatisfied === true)){
        let filterOk = true;
        for (const ingredient in myRecipeItem.ingredients){
          // @ts-ignore
          if (myRecipeItem.ingredients[ingredient].selected && this.query.undesiredIngredients[ingredient].selected){
            filterOk = false;
            filtersSatisfied = false;
            break;
          }
        }
        if (filterOk){
          if (--numberOfFilters === 0) {
            this.recipes.push(myRecipeItem as RecipeItem);
            this.noRecipe = false;
          }
        }else{
          filtersSatisfied = false;
        }
      }
    }
  }
}
