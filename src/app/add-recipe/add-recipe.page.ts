import {Component, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RecipeItemService } from './../shared/recipe-item.service';
import {IngredientsDic} from '../shared/recipeItem';

// Upload image
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import {IonSearchbar} from '@ionic/angular';

// Uploaded image info
export interface MyImage {
  name: string;
  filepath: string; // file path in the database
  size: number;
}


@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.page.html',
  styleUrls: ['./add-recipe.page.scss'],
})

export class AddRecipePage implements OnInit {
  // Find the search bar in the HTML DOM
  @ViewChild('search', {static: false}) search: IonSearchbar;
  ingredients: any;
  showSearchBarResults: boolean; // If something is typed in the searchbar than show the results list
  ingredientSelectedIcon: boolean;
  // Parameter required to upload recipe info
  recipeForm: FormGroup;
  // Parameters required to upload an image
  // Upload Task
  task: AngularFireUploadTask;
  // Progress in percentage
  percentage: Observable<number>;
  // Snapshot of uploading file
  snapshot: Observable<any>;
  // Uploaded File URL
  UploadedFileURL: Observable<string>;
  // Uploaded Image List
  images: Observable<MyImage[]>;
  // File details
  fileName: string;
  fileSize: number;
  // Status check
  isUploading: boolean;
  isUploaded: boolean;

  private imageCollection: AngularFirestoreCollection<MyImage>;
  private imgsCount: number;
  private imagesUploaded: string[];


  constructor(
    private aptService: RecipeItemService,
    private router: Router,
    public fb: FormBuilder,
    private storage: AngularFireStorage, private database: AngularFirestore  // upload image
  ) {
    this.isUploading = false;
    this.isUploaded = false;
    // Set collection where our documents/ images info will save
    this.imageCollection = database.collection<MyImage>('freakyImages');
    this.images = this.imageCollection.valueChanges();
    this.ingredientSelectedIcon = false;

  }

  // Reset some variables before the user can interact with this tab
  ngOnInit(): void {
    this.recipeForm = this.fb.group({
      $key: Math.random().toString(12).substring(2, 8) + Date.now(),
      name: [''],
      recipeText: [''],
      recipeDifficulty: [''],
      recipeTime: [''],
      ingredientsForm: new IngredientsDic(),
      imgsCount: 0,
      videoUrl: '',
      collection: ''
    });
    this.imagesUploaded = [];
    // This variable is needed for the searchbar functionality
    this.ingredients = this.recipeForm.value.ingredientsForm.ingredients;
    this.showSearchBarResults = false; // When the searchbar is empty don't show (all) the ingredients list
  }

  // Same as ngOnInit() because we need to reset everything even when the user switches between tabs
  ionViewWillEnter() {
    this.recipeForm = this.fb.group({
      $key: Math.random().toString(12).substring(2, 8) + Date.now(),
      name: [''],
      recipeText: [''],
      recipeDifficulty: [''],
      recipeTime: [''],
      ingredientsForm: new IngredientsDic(),
      imgsCount: 0,
      videoUrl: '',
      collection: ''
    });
    this.imagesUploaded = [];
    this.ingredients = this.recipeForm.value.ingredientsForm.ingredients;
    this.showSearchBarResults = false;
  }

  formSubmit() {
    if (!this.recipeForm.valid) {
      return false;
    } else {
      console.log(this.recipeForm.value);
      if (this.recipeForm.value.collection !== ''){
        this.aptService.createCollection(this.recipeForm.value.$key, this.recipeForm.value.collection);
      }
      this.aptService.createRecipeItem(this.recipeForm.value).then(res => {
        this.recipeForm.reset();
        this.router.navigate(['/presentation']);
      })
        .catch(error => console.log(error));
    }
  }


  // upload image
  uploadFile(event: FileList) {
    // The File object
    const file = event.item(0);

    // Validation for Images Only
    if (file.type.split('/')[0] !== 'image') {
      console.error('unsupported file type :( ');
      return;
    }

    this.isUploading = true;
    this.isUploaded = false;
    this.imagesUploaded.push(file.name);


    this.fileName = file.name;

    // The storage path
    const randomPathName = this.recipeForm.getRawValue().$key;
    const path = randomPathName + '/' + randomPathName + '_' + this.recipeForm.value.imgsCount + '.jpg';
    this.recipeForm.value.imgsCount++;


    // File reference
    const fileRef = this.storage.ref(path);

    // The main task
    this.task = this.storage.upload(path, file);

    // Get file progress percentage
    this.percentage = this.task.percentageChanges();
    this.snapshot = this.task.snapshotChanges().pipe(

      finalize(() => {
        // Get uploaded file storage path
        this.UploadedFileURL = fileRef.getDownloadURL();

        this.UploadedFileURL.subscribe(resp => {
          this.addImagetoDB({
            name: file.name,
            filepath: resp,
            size: this.fileSize
          });
          this.isUploading = false;
          this.isUploaded = true;
        }, error => {
          console.error(error);
        });
      }),
      tap(snap => {
        this.fileSize = snap.totalBytes;
      })
    );
  }

  addImagetoDB(image: MyImage) {
    // Create an ID for document
    const id = this.database.createId();

    // Set document id with value in database
    this.imageCollection.doc(id).set(image).then(resp => {
      console.log(resp);
    }).catch(error => {
      console.log('error ' + error);
    });
  }

  // search bar
  _ionChange(event){
    const val = event.target.value;
    if (val.trim() !== ''){
      this.showSearchBarResults = true;
    }else {
      this.showSearchBarResults = false;
    }

    this.ingredients = this.recipeForm.value.ingredientsForm.ingredients;

    if (val && val.trim() !== ''){
      this.ingredients = Object.keys(this.ingredients).filter((item: any) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      });
    }
  }

  toggleIngredient(ingredient: unknown){
    // Change ingredient's state
    // @ts-ignore
    // tslint:disable-next-line:max-line-length
    this.recipeForm.value.ingredientsForm.ingredients[ingredient].selected = !this.recipeForm.value.ingredientsForm.ingredients[ingredient].selected;
    this.ingredientSelectedIcon = !this.ingredientSelectedIcon;
  }

  changeDose(event, ingredient: unknown){
    // @ts-ignore
    this.recipeForm.value.ingredientsForm.ingredients[ingredient].dose = event.detail.value;
  }

  changeDoseType(event, ingredient: unknown){
    // @ts-ignore
    this.recipeForm.value.ingredientsForm.ingredients[ingredient].unit = event.detail.value;
  }



}
