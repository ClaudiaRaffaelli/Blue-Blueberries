# Overview
![GitHub last commit](https://img.shields.io/github/last-commit/ClaudiaRaffaelli/smartCookbook)
- **Academic year:** 2020-2021
- **Project title:** Smart Cookbook
- **Students:** [Abdullah Chaudhry](https://github.com/chabdullah) and [Claudia Raffaelli](https://github.com/ClaudiaRaffaelli)
- **CFUs:** 9

**SmartCookbook** is going to be a cooking recipe app built with Ionic framework [1] and Apache Cordova [2], which unlike many others already available application will also offer to the user the capability of being able to interact through an in-app voice assistant. The user will have available a number of recipes hosted on a Google Firebase database [3] grouped according to predefined collections. However we also want to offer the possibility to customize the collections through the creation of private collections stored locally and to which recipes can be added. There will also be advanced search, shopping list and weekly plan features.

# Tools and Techniques
The main tools we will be using are:
- Ionic Framework [1] toolkit for building a cross-platform mobile app integrated with Angular [4],
- Apache Cordova to build and deploy as a native app [2],
- Google Firebase database for hosting the recipes and fixed collections [3],
- Ionic Storage for saving in-app data like recipes in grocery list, custom collections, dietary preferences [5], 
- Ionic Speech Recognition for the realization of the voice assistant [6].

# Expected Outcomes
The main features of this application will be:
- A **home page** that will list a set of recipe collections divided into different thematic categories,
- An **advanced search page** that will allow the user to specify different queries. Some of the filters that we will introduce are:
  - Difficulty,
  - Undesirable ingredients and on the other hand, available ingredients,
  - Thematic categories such as Christmas recipes, Easter recipes, Vegetarian recipes and so on and so forth.
- A **custom collections page** that will show all the collections created by the user, along with a private but non-deletable *Favorites* collection. In order to facilitate the quickest possible insertion of a recipe into a private collection, it will be possible to click on a heart-shaped icon in the external view page of the recipe. The popover that will be opened will allow the insertion of the recipe in previously created collections, as well as the creation of new collections.
- A **preferences page** that will store the user preferences such as dietary preferences, disliked ingredients, allergic ingredients. Recipes with ingredients that fall in this categories will not be shown throughout the app.
- A **grocery list page** to which can be added and removed recipes. It will be given the possibility also to temporarily exclude from the list of ingredients all those belonging to a certain recipe. In addition, an ingredient marked as purchased will be displayed as crossed out and placed at the bottom of the list of ingredients.
- A **weekly meal plan page** that will offer a different set of recipes each week and for each day of the week, allowing the user to discover new recipes.
- The **page of recipe visualization** will be designed to provide at a glance all the information necessary for the user to understand whether or not they are interested in the recipe itself. So once opened it will be immediately shown an image of the dish, the difficulty and some other characteristics such as if it is suitable for celiac, lactose intolerant and so on. Immediately after it will be shown the list of ingredients and provided a link to a video if available. Then it will be listed the whole process of recipe realization divided into steps, each with plenty of photographs.
- A **voice assistant** which will be made available either by calling it vocally or by pressing a special button located on each page of the application. The assistant will be able to browse recipes according to queries imposed by the user, set a timer, add recipes to the shopping list or private collections, read the steps of a recipe or bring the application view to a certain step. All this is done with the aim of making the application as hand free as possible, which allows the user to keep their *fingers in the pie* for most of the time. 

# Summary
The idea of this application is to allow the easiest possible access to the recipes that are the focus of the user's interest. The functionality of advanced search and specific food preferences wants to favor this requirement as much as possible by not showing uninteresting recipes and speeding up the process of discovering and searching for recipes. In addition, the voice assistant will offer a support role for advanced search, starting timers, reading recipes, inserting recipes into collections. All this with the aim of simplifying to the full the operations that revolve around the main role of the application, which is to allow a convenient consultation of recipes.


# Project Documents


# Bibliography
\[1\] https://ionicframework.com

\[2\] https://cordova.apache.org

\[3\] https://firebase.google.com

\[4\] https://angular.io

\[5\] https://github.com/ionic-team/ionic-storage

\[6\] https://ionicframework.com/docs/native/speech-recognition

# Acknowledgments
Human Computer Interaction project - Computer Engineering Master Degree @[University of Florence](https://www.unifi.it/changelang-eng.html)
