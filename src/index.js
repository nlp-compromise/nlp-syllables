'use strict';
const syllables = require('./syllables');

// set method on 'Term', then reference that on Sentence & Text
let plugin = {
  Term: {
    syllables : function() {
      return syllables(this.normal);
    }
  },
  Sentence: {
    syllables: function() {
      return this.terms.map(function(t) {
        return t.syllables();
      });
    }
  },
  Text: {
    syllables: function() {
      return this.sentences.map(function(s) {
        return s.syllables();
      });
    }
  }
};

module.exports = plugin;

// let w = nlp.text('i see canadian tire');
// console.log(w.syllables());
