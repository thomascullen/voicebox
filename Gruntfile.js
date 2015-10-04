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
          dir: '.',
          asar: false,
          out: 'dist',
          arch: 'x64',
          overwrite: true,
          name: 'VoiceBox',
          version: '0.33.4',
          platform: 'darwin',
          icon: 'assets/icon.icns',
          'app-version'   : packageJson.version,
          ignore: '^(/dist|/components|)$',
        }
      }
    }
  });

  grunt.registerTask('default', ['env:dev', 'babel', 'watch']);
  grunt.registerTask('build', ['env:dist', 'clean', 'babel', 'electron']);
};
