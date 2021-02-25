import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { AddRecipePageRoutingModule } from './add-recipe-routing.module';

import { AddRecipePage } from './add-recipe.page';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddRecipePageRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [AddRecipePage]
})
export class AddRecipePageModule {}
