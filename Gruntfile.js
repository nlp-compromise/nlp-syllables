module.exports = function (grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('./package.json'),

    watch: {
      files: ['./src/*', './src/**'],
      tasks: ['run:index']
    },

    run: {
      index: {
        exec: 'node ./src/index.js'
      },
      build: {
        exec: 'browserify ./src/index.js --standalone nlpSyllables -o ./builds/nlp-syllables.js -t [ babelify --presets [ es2015 ] ]'
      }
    },

    filesize: {
      base: {
        files: [{
          src: ['./builds/nlp-syllables.js']
        }],
        options: {
          ouput: [{
            stdout: true
          }]
        }
      }
    },

    uglify: {
      'do': {
        src: ['./builds/nlp-syllables.js'],
        dest: './builds/nlp-syllables.min.js'
      },
      'options': {
        preserveComments: false,
        mangle: true,
        banner: ' /*nlp-syllables <%= pkg.version %>  MIT*/\n\n',
        compress: {
          drop_console: true,
          dead_code: true,
          properties: true,
          unused: true,
          warnings: true
        }
      }
    },
    mochaTest: {
      test: {
        options: {
          // require: 'babel/register',
          reporter: 'spec',
          clearRequireCache: true,
          colors: true,
          growl: false
        },
        src: ['test/unit_tests/*.js']
      }
    },

    mocha_istanbul: {
      coverageSpecial: {
        src: 'test/unit_tests/*.js',
        options: {
          reportFormats: ['html'],
          quiet: true,
          coverageFolder: './tests/coverage'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-filesize');
  grunt.loadNpmTasks('grunt-mocha-istanbul');

  grunt.registerTask('default', ['run:index']);
  grunt.registerTask('watch', ['watch']);
  grunt.registerTask('coverage', ['mocha_istanbul']);
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('build', ['mochaTest', 'run:build', 'uglify', 'filesize']);
};
