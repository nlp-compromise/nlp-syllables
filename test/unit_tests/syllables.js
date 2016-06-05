'use strict';
let mocha = require('mocha');
let should = require('should');
//apply the plugin
const syllables = require('../../src/index.js');
const nlp = require('nlp_compromise');
nlp.plugin(syllables);

describe('syllables', function() {

  //americanize it
  it('verify syllables for term', function(done) {
    let tests = [
      'sud den ly',
      'con sti pa tion',
      'di a bo lic',
      'fa ted',
      'ge ne tic',
      'hy giene',
      'o ma ha',
      'i mi ta ted',
      'tree',
      'ci vi lised',
      'went',
      'to ge ther',
      'tog gle',
      'move ment',
      'mo ment',
      'do nate',
      'vi king',
      'wat tage',
      'con gre gate',
      'some thing',
      'sales man',
      're sour ces',
      'eve ry thing',
      'eve ry bo dy',
      'hole',
      'ho ly',
      'sec ret',
      'cause',
      'fate',
      'fates',
      'eu lo gy',
      // 'deviled',
      // 'horse',
    ];
    tests.forEach(function(word_with_syllable_breaks) {
      let s = nlp.term(word_with_syllable_breaks.replace(/ /g, '')).syllables();
      s.join(' ').should.equal(word_with_syllable_breaks);
    });
    done();
  });

});
