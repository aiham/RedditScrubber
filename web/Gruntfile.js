module.exports = function (grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    sass: {
      options: {
        includePaths: ['bower_components/foundation/scss']
      },
      dist: {
        options: {
          outputStyle: 'compressed'
        },
        files: {
          'public/stylesheets/app.css': 'scss/app.scss'
        }
      }
    },

    copy: {
      main: {
        files: [
          {expand: true, flatten: true, dest: 'public/javascripts/vendor/', src: 'bower_components/modernizr/modernizr.js'},
          {expand: true, flatten: true, dest: 'public/javascripts/vendor/', src: 'bower_components/foundation/js/foundation.min.js'},
          {expand: true, flatten: true, dest: 'public/javascripts/vendor/', src: 'bower_components/jquery/dist/jquery.min.js'},
        ]
      }
    },


    watch: {
      options: {
        livereload: true
      },

      js: { files: ['public/javascripts/*.js'] },

      jade: { files: ['views/*.jade'] },

      grunt: { files: ['Gruntfile.js'] },

      sass: {
        files: 'scss/**/*.scss',
        tasks: ['sass']
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('build', ['sass', 'copy']);
  grunt.registerTask('default', ['build', 'watch']);

};
