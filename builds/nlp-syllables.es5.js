(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.nlpSyllables = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _syllables = require('./syllables');

// set method on 'Term', then reference that on Sentence & Text
var nlpSyllables = {
  Term: {
    syllables: function syllables() {
      return _syllables(this.normal);
    }
  },
  Sentence: {
    syllables: function syllables() {
      return this.terms.map(function (t) {
        return t.syllables();
      });
    }
  },
  Text: {
    syllables: function syllables() {
      return this.sentences.map(function (s) {
        return s.syllables();
      });
    }
  }
};

module.exports = nlpSyllables;

// const nlp = require('nlp_compromise');
// nlp.plugin(nlpSyllables);
// let w = nlp.text('i see canadian tire');
// console.log(w.syllables());

},{"./syllables":2}],2:[function(require,module,exports){
//chop a string into pronounced syllables
'use strict';

//suffix fixes

function postprocess(arr) {
  //trim whitespace
  arr = arr.map(function (w) {
    return w.trim();
  });
  arr = arr.filter(function (w) {
    return w !== '';
  });
  // if (arr.length > 2) {
  //   return arr;
  // }
  var ones = [/^[^aeiou]?ion/, /^[^aeiou]?ised/, /^[^aeiou]?iled/];
  var l = arr.length;
  if (l > 1) {
    var suffix = arr[l - 2] + arr[l - 1];
    for (var i = 0; i < ones.length; i++) {
      if (suffix.match(ones[i])) {
        arr[l - 2] = arr[l - 2] + arr[l - 1];
        arr.pop();
      }
    }
  }
  return arr;
}

var syllables = function syllables(str) {
  var all = [];

  if (str.match(' ')) {
    return str.split(/ /g).map(function (s) {
      return syllables(s);
    });
  }

  //method is nested because it's called recursively
  var doer = function doer(w) {
    var vow = /[aeiouy]$/;
    var chars = w.split('');
    var before = '';
    var after = '';
    var current = '';
    for (var i = 0; i < chars.length; i++) {
      before = chars.slice(0, i).join('');
      current = chars[i];
      after = chars.slice(i + 1, chars.length).join('');
      var candidate = before + chars[i];

      //it's a consonant that comes after a vowel
      if (before.match(vow) && !current.match(vow)) {
        if (after.match(/^e[sm]/)) {
          candidate += 'e';
          after = after.replace(/^e/, '');
        }
        all.push(candidate);
        return doer(after);
      }
      //unblended vowels ('noisy' vowel combinations)
      if (candidate.match(/(eo|eu|ia|oa|ua|ui)$/i)) {
        //'io' is noisy, not in 'ion'
        all.push(before);
        all.push(current);
        return doer(after); //recursion
      }
    }
    //if still running, end last syllable
    if (str.match(/[aiouy]/) || str.match(/ee$/)) {
      //allow silent trailing e
      all.push(w);
    } else {
      all[all.length - 1] = (all[all.length - 1] || '') + str; //append it to the last one
    }
  };

  str.split(/\s\-/).forEach(function (s) {
    doer(s);
  });
  all = postprocess(all);

  //for words like 'tree' and 'free'
  if (all.length === 0) {
    all = [str];
  }
  //filter blanks
  all = all.filter(function (s) {
    return s !== '' && s !== null && s !== undefined;
  });

  return all;
};

// console.log(syllables('civilised'));

module.exports = syllables;

},{}]},{},[1])(1)
});