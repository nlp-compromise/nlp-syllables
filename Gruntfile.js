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
        exec: 'browserify ./src/index.js --standalone nlpSyllables -o ./builds/nlp-syllables.latest.js -t [ babelify --presets [ es2015 ] ]'
      },
      copy: {
        exec: 'cp ./builds/nlp-syllables.latest.js ./builds/nlp-syllables.<%=pkg.version%>.js'
      }
    },

    filesize: {
      base: {
        files: [{
          src: ['./builds/nlp-syllables.latest.js']
        }],
        options: {
          ouput: [{
            stdout: true
          }]
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
  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-filesize');
  grunt.loadNpmTasks('grunt-mocha-istanbul');

  grunt.registerTask('default', ['run:index']);
  grunt.registerTask('watch', ['watch']);
  grunt.registerTask('coverage', ['mocha_istanbul']);
  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('build', ['mochaTest', 'run:build', 'run:copy', 'filesize']);
};
