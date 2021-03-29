import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'presentation',
    pathMatch: 'full'
  },
  {
    path: 'add-recipe',
    loadChildren: () => import('./add-recipe/add-recipe.module').then( m => m.AddRecipePageModule)
  },
  {
    path: 'view-recipe',
    loadChildren: () => import('./view-recipe/view-recipe.module').then( m => m.ViewRecipePageModule)
  },
  {
    path: 'search-recipe',
    loadChildren: () => import('./search-recipe/search-recipe.module').then( m => m.SearchRecipePageModule)
  },
  {
    path: 'collections',
    loadChildren: () => import('./collections/collections.module').then( m => m.CollectionsPageModule)
  },
  {
    path: 'presentation',
    loadChildren: () => import('./presentation/presentation.module').then( m => m.PresentationPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'groceries',
    loadChildren: () => import('./groceries/groceries.module').then( m => m.GroceriesPageModule)
  },
  {
    path: 'preferences',
    loadChildren: () => import('./preferences/preferences.module').then( m => m.PreferencesPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
