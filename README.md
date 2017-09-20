# rf-load

* simple asynchron NodeJS module loading lib
* load single files, node modules, functions, or a complete directory
* all modules are collected in a list, then required and started one by one
* modules are kept in memory and can be accessed with a require() like function at any time

## Getting Started

> npm install rf-load

```js
var load = new(require("rf-load").moduleLoader)();

// get the modules

//files
   load.setModulePath("moduledir");
   load.file("db"); // load moduledir/db.js
   load.file("acl", { parameters: 123 }); // additional parameters

// npm module
   load.module("web", { parameters: 123 });

// function
   load.func(function (options, next) {
      console.log("I am a function " + options.whatami);
      next();
   }, { whatami: "without name" } ); // load a function


// start modules one by one
load.startModules();
```


Or load all files in a directory parallel:
```js
load.getDirectoryPaths('./server/api').forEach(function(path){
   // start each file with specific arguments
   require(path).start(dataBase, app);
});

// place the above code in the module loader,
// if it shoud be executed, after other module were loaded:
load.func(function (options, next) {
   load.getDirectoryPaths('./server/api').forEach(function(path){
      require(path).start(dataBase, app);
   }); next();
});


```


## Module structure

* 'start' function necessary
*  the start function calls the next module. If it fails, the module execution will not finish.

```js
"use strict";

module.exports.start = function (options, next) {
   // ...do your module things

   // call the next module
   next();
}
```

## Accessing modules from other files

* modules can be accessed after loading with a special require function
* intention: main module loads and configures all required modules
* similar ro `require()`, but it throws an error if the module hasn't been loaded


```js
var acl = require("rf-load").require("acl");
// You can now access any module.exports variables and functions from the acl module
```

## Conflicting module names

If you have modules with the same name in you .require() calls, define a prefix in front of each modules name.

For example two module directories:
* moddir1
  * mod1.js
  * mod2.js
* moddir2
  * mod1.js
  * mod2.js

Include them:
```js
var load1 = new(require("rf-load").moduleLoader)("dir1.");
load1.moduleDirectory("moddir1");
load1.startModules();

var load2 = new(require("rf-load").moduleLoader)("dir2.");
load2.moduleDirectory("moddir2");
load2.startModules();
```

Now require them individually with their prefix:
```js
var moddir1_mod2 = require("rf-load").require("dir1.mod2"),
    moddir2_mod1 = require("rf-load").require("dir2.mod1");
```


## Legal Issues
* Licenese: MIT
* Author: Julian von Mendel
