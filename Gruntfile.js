'use strict';

var packageJson = require('./package.json')

module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-electron');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    env: {
      dev  : { 'NODE_ENV' : 'development' },
      dist : { 'NODE_ENV' : 'production' }
    },
    clean: {
      dist: ['dist/*'],
    },
    babel: {
      dist: {
        files: [{
          expand: true,
          cwd: 'components',
          src: ['**/*.js'],
          dest: 'views/components/',
          ext: '.js'
        }]
      }
    },
    watch: {
      scripts: {
        files: ['components/**/*.js'],
        tasks: ['babel']
      },
    },
    electron: {
      osxBuild: {
        options: {
          name: 'VoiceBox',
          dir: '.',
          asar: true,
          out: 'dist',
          arch: 'x64',
          overwrite: true,
          version: '0.33.3',
          platform: 'darwin',
          icon: 'assets/icon.icns',
          ignore: '^(dist|components|responders)$',
          'app-version'   : packageJson.version,
        }
      }
    }
  });

  grunt.registerTask('default', ['env:dev', 'watch']);
  grunt.registerTask('build', ['env:dist', 'clean', 'babel', 'electron']);
};
