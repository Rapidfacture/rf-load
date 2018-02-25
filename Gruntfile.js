
module.exports = function (grunt) {
   grunt.loadNpmTasks('grunt-eslint');
   grunt.loadNpmTasks('grunt-mocha-test');

   grunt.registerTask('default', ['eslint']);
   grunt.registerTask('unitTest', ['mochaTest']);

   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      eslint: {
         options: {
            configFile: '.eslintrc'
         },
         target: ['*.js']
      },

      mochaTest: {
         test: {
            options: {
               reporter: 'spec',
               captureFile: 'results.txt', // Optionally capture the reporter output to a file
               quiet: false, // Optionally suppress output to standard out (defaults to false)
               clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
               clearCacheFilter: (key) => true, // Optionally defines which files should keep in cache
               noFail: false // Optionally set to not fail on failed tests (will still fail on other errors)
            },
            src: ['test/*.js']
         }
      }
   });
};
