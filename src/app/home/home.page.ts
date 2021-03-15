import {Component, OnInit} from '@angular/core';
import {IngredientsDic, RecipeItem} from '../shared/recipeItem';
import { RecipeItemService } from './../shared/recipe-item.service';
import firebase from 'firebase';
import 'firebase/storage'; // in order to use images stored in the firebase database
import {Router, NavigationExtras, ActivatedRoute} from '@angular/router'; // pass data between two pages
import {PopoverController} from "@ionic/angular";
import {PopoverCollectionsComponent} from "../popover-collections/popover-collections.component";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {
  recipes = []; // Here are going to be saved all the recipes downloaded from the database
  pathReference: any;
  imgs: []; // Title images downloaded from the firebase storage
  recipesRes: any;
  query = {}; // query from search-page
  dataFetched: boolean; // flag that indicates when all recipes data have been downloaded from the database
  isCollection = false;
  collection = {}; // collection got from custom collection page

  constructor(
    private aptService: RecipeItemService,
    private route: ActivatedRoute,
    private router: Router,
    public popoverController: PopoverController,
  ) { this.route.queryParams.subscribe(async params => {
    if (this.router.getCurrentNavigation().extras.state) {
      this.query = this.router.getCurrentNavigation().extras.state.query;
      this.isCollection = this.router.getCurrentNavigation().extras.state.isCollection;

      // If we are navigating from the page where there are listed all the collection.
      // in this page are shown all the recipes from that collection
      if (this.isCollection === true){
        console.log("true")
        this.recipes = []
        this.collection = this.router.getCurrentNavigation().extras.state.collection;

        var database = firebase.database().ref();
        for (let recipeKey of this.collection["recipeList"]){

          const myRecipeItem = await database.child("recipes").child(recipeKey).get().then(function(snapshot) {
            if (snapshot.exists()) {
              const myRecipeItem = snapshot.val();
              // @ts-ignore
              myRecipeItem.$key = recipeKey;
              console.log(myRecipeItem)
              return myRecipeItem
            }
            else {
              console.log("No data available");
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
          this.recipes.push(myRecipeItem as RecipeItem);
          console.log(this.recipes)
        }
        this.dataFetched = true;
      } else{
        // navigating here from the search page
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
            let numberOfFilters = Object.keys(this.query).length; // get the number of queries
            if (numberOfFilters === 0){ // no filters applied
              this.recipes.push(myRecipeItem as RecipeItem);
            }else{
              // filtersSatisfied true means no filter has been checked or each filter is satisfied by now. If a filter is not satisfied then
              // filtersSatisfied is changed to false in order to save computational time because the next filters are not going to be checked
              let filtersSatisfied = true;
              // Check queries one by one
              if (this.query['recipeName'] && (filtersSatisfied === true)){
                if (myRecipeItem.name.toLowerCase().indexOf(this.query['recipeName'].toLowerCase()) !== -1){
                  if (--numberOfFilters === 0)
                    this.recipes.push(myRecipeItem as RecipeItem);
                }else{
                  filtersSatisfied = false;
                }
              }
              if (this.query['difficulty'] && (filtersSatisfied === true)){
                // @ts-ignore
                if ((myRecipeItem.recipeDifficulty as RecipeItem) === this.query['difficulty']) {
                  if (--numberOfFilters === 0)
                    this.recipes.push(myRecipeItem as RecipeItem);
                }else{
                  filtersSatisfied = false;
                }
              }
              if (this.query['requiredTime'] && (filtersSatisfied === true)){
                // @ts-ignore
                if ((myRecipeItem.recipeTime as RecipeItem) <= this.query['requiredTime']) {
                  if (--numberOfFilters === 0)
                    this.recipes.push(myRecipeItem as RecipeItem);
                }else{
                  filtersSatisfied = false;
                }
              }
              if (this.query['availableIngredients'] && (filtersSatisfied === true)){
                let filterOk = true;
                for (const ingredient in myRecipeItem.ingredients){
                  if (myRecipeItem.ingredients[ingredient].selected && !this.query['availableIngredients'][ingredient].selected){
                    filterOk = false;
                    filtersSatisfied = false;
                    break;
                  }
                }
                if (filterOk){
                  if (--numberOfFilters === 0)
                    this.recipes.push(myRecipeItem as RecipeItem);
                }else{
                  filtersSatisfied = false;
                }
              }
              if (this.query['undesiredIngredients'] && (filtersSatisfied === true)){
                let filterOk = true;
                for (const ingredient in myRecipeItem.ingredients){
                  if (myRecipeItem.ingredients[ingredient].selected && this.query['undesiredIngredients'][ingredient].selected){
                    filterOk = false;
                    filtersSatisfied = false;
                    break;
                  }
                }
                if (filterOk){
                  if (--numberOfFilters === 0)
                    this.recipes.push(myRecipeItem as RecipeItem);
                }else{
                  filtersSatisfied = false;
                }
              }
            }

          });
          this.dataFetched = true;
        });
      }
    }
  });
  }


  ngOnInit() {
  }


  async presentPopover(eve: any, recipeKey: string) {
    const popover = await this.popoverController.create({
      component: PopoverCollectionsComponent,
      cssClass: 'popOver',
      componentProps: {
        // communicating the recipe key to the popover for when the recipe will be added to the collection
        "recipeKey": recipeKey,
      },
      event: eve,
      mode: 'ios',
      translucent: true
    });

    popover.onWillDismiss().then(() =>{
          //alert("before dismissing the popover")
    });
    popover.onDidDismiss().then(() => {
          //alert("popover dismissed")
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
}
