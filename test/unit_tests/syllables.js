'use strict';
let mocha = require('mocha');
let should = require('should');
//apply the plugin
const syllables = require('../../src/index.js');
const nlp = require('../../../nlp_compromise');
nlp.plugin(syllables);

describe('syllables', function() {

  //americanize it
  it('count syllables for term', function(done) {
    let tests = [
      ['suddenly', 3],
      ['constipation', 4],
      ['diabolic', 4],
      ['fated', 2],
      ['genetic', 3],
      ['imitated', 4],
      ['tree', 1],
      ['civilised', 3],
    // ['fate', 1],
    // ['fates', 1],
    // ['deviled', 3],
    // ['horse', 1]
    ];
    tests.forEach(function(a) {
      let t = nlp.term(a[0]);
      t.syllables().length.should.equal(a[1]);
    });
    done();
  });

});
