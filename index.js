// rf-load initializes rapidfacture and node modules
/* jshint node: true */ "use strict";

var fs = require("fs");
var logPrefix = "[rf-load] ";
var exp = module.exports;
exp.modules = {};


// error handling
var logError = function(err){
   throw new Error(console.log(logPrefix + err));
};
try { // try using rf-log
   var critical = require(require.resolve("rf-log")).critical;
   if(critical) logError = function(err){critical(logPrefix, err);};
} catch (e) {}



exp.require = function (module) {
   if (exp.modules[module] === undefined) {
      logError("Module '" + module + "' wasn't loaded yet! Include it in your load process.");
   }
   if (typeof exp.modules[module].require === "string") {
      logError("You are using a forward dependency for module '" + module + "'. Fix the order of your module inclusions or avoid this dependency.");
   }
   return exp.modules[module];
};



exp.moduleLoader = function (modulePrefix) {
   modulePrefix = ((typeof modulePrefix == "string") ? modulePrefix : "");

   // Init
   var modulepath = ".";
   var setModulePath = function (path) {
      modulepath = path;
   };


   // Load module file path for the first time
   function loadFile(module, options, useBasePath) {
      var path = ((useBasePath) ? "" : modulepath);
      return loadModule(path + "/" + module + ".js", options);
   }

   // Load module for the first time (NPM or file path)
   function loadModule(module, options) {
      // ensure module name contains no directory path or a file extension
      var name = module.split(/[\\/]/).pop().replace(/\.[^/.]+$/, "");
      return loadFunction(null, options, name, { require: module });
   }

   // Load function
   var moduleoptions = {}, modulelist = [], unnamedModuleCounter = 0;
   function loadFunction(func, options, modulename, obj) {
      if (typeof modulename != 'string') {
         // Function without a name. Create one.
         modulename = "unnamed." + (unnamedModuleCounter++);
      }
      modulename = modulePrefix + modulename;

      //log.info("Mod '"+modulename+"' loaded."));
      exp.modules[modulename] = ((typeof obj == 'object') ? obj : { start: func });
      moduleoptions[modulename] = ((typeof options == 'object') ?
            options : {});

      // Register module for loading
      modulelist.push(modulename);

      return true;
   }

   // Start modules
   var modulePosition = 0; // How many modules have been worked off so far?
   function startModules (noclear) {
      if (!noclear) {
         loadFunction(function (options, next) {
            modulelist = [];
            modulePosition = 0;
            moduleoptions = {};
         }, null, '__clear');
      }

      function next() {
         var module = modulelist[modulePosition++];
         //log.info("Executing module '" + module + "' (position " + modulePosition);

         if (typeof exp.modules[module].require === "string") {
            try {
               exp.modules[module] = require(require.resolve(
                        exp.modules[module].require));
            } catch(e) {
               logError("Error loading module '" + module + "': " + e.message);
               return false;
            }
         }

         if (typeof exp.modules[module].start !== "function") {
            logError("Module '" + module + "' has no start() function!");
            return false;
         }

         exp.modules[module].start(moduleoptions[module], next);
      }
      next();
   }


   // Load all modules in a list serially
   function loadModules(modules, useBasePath) {
      modules.forEach(function (m) {

         if (typeof m == 'string')  loadFile(m, {}, useBasePath);

         if (typeof m != 'object') return;

         if (m.type == 'file') loadModule(m.file, m.options, useBasePath);

         if (m.type == 'npm')  loadModule(m.name, m.options);

         if (m.type == 'function') loadFunction(m.func, m.options, m.name, m.obj);

      });
      return true;
   }

   // Load all modules from a directory in parallel
   function loadModuleDirectory (path) {
      return loadModules(getDirectoryPaths(path), true);
   }


   function getDirectoryPaths(path){
      var pathList = [];
      fs.readdirSync(path).forEach(function(file) {
         var filePath = path + '/' + file;
         var stat = fs.statSync(filePath);

         if (stat && stat.isDirectory()) {
           pathList = pathList.concat(getDirectoryPaths(filePath));
         } else if (file[0] != '.') {
           pathList.push(path + '/' + file.split(".")[0]);
         }
      });
      return pathList;
   }


   return {
      setModulePath: setModulePath,
      //loadModules: loadModules,
      moduleDirectory: loadModuleDirectory,
      startModules: startModules,
      getDirectoryPaths: getDirectoryPaths,

      file: loadFile,
      module: loadModule,
      func: loadFunction,
   };
};
