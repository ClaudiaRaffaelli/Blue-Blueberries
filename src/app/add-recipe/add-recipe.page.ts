import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { RecipeItemService } from './../shared/recipe-item.service';

// Upload image
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';

export interface MyTitleImage {
  name: string;
  filepath: string;
  size: number;
}
//

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.page.html',
  styleUrls: ['./add-recipe.page.scss'],
})

export class AddRecipePage implements OnInit {
  recipeForm: FormGroup;
  // Parameter required to upload an image
  // Upload Task
  task: AngularFireUploadTask;
  // Progress in percentage
  percentage: Observable<number>;
  // Snapshot of uploading file
  snapshot: Observable<any>;
  // Uploaded File URL
  UploadedFileURL: Observable<string>;
  // Uploaded Image List
  images: Observable<MyTitleImage[]>;
  // File details
  fileName: string;
  fileSize: number;
  // Status check
  isUploading: boolean;
  isUploaded: boolean;

  private imageCollection: AngularFirestoreCollection<MyTitleImage>;
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
    this.imageCollection = database.collection<MyTitleImage>('freakyImages');
    this.images = this.imageCollection.valueChanges();
  }

  ngOnInit(): void {
    this.recipeForm = this.fb.group({
      $key: Math.random().toString(12).substring(2, 8) + Date.now(),
      name: [''],
      recipeText: [''],
      recipeTime: ['']
    });
    this.imgsCount = 0;
    this.imagesUploaded = [];
  }

  ionViewWillEnter() {
    this.recipeForm = this.fb.group({
      $key: Math.random().toString(12).substring(2, 8) + Date.now(),
      name: [''],
      recipeText: [''],
      recipeTime: ['']
    });
    this.imgsCount = 0;
    this.imagesUploaded = [];
  }

  formSubmit() {
    if (!this.recipeForm.valid) {
      return false;
    } else {
      this.aptService.createRecipeItem(this.recipeForm.value).then(res => {
        console.log(res);
        this.recipeForm.reset();
        this.router.navigate(['/home']);
      })
        .catch(error => console.log(error));
    }
  }

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
    const path = randomPathName + '/' + randomPathName + '_' + this.imgsCount + '.jpg';
    this.imgsCount++;


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

  addImagetoDB(image: MyTitleImage) {
    // Create an ID for document
    const id = this.database.createId();

    // Set document id with value in database
    this.imageCollection.doc(id).set(image).then(resp => {
      console.log(resp);;
    }).catch(error => {
      console.log('error ' + error);
    });
  }



}
