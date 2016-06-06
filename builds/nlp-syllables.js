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
// const w = nlp.text('i see canadian tire');
// console.log(w.syllables());

},{"./syllables":2}],2:[function(require,module,exports){
//chop a string into pronounced syllables
'use strict';

var ones = [/^[^aeiou]?ion/, /^[^aeiou]?ised/, /^[^aeiou]?iled/,

// -ing, -ent
/[aeiou][n][gt]$/,

// -ate, -age
/\wa[gt]e$/];
var all_spaces = / /g;
var ends_with_vowel = /[aeiouy]$/;
var starts_with_e_then_specials = /^e[sm]/;
var starts_with_e = /^e/;
var ends_with_noisy_vowel_combos = /(eo|eu|ia|oa|ua|ui)$/i;
var starts_with_single_vowel_combos = /^(eu)/i;
var aiouy = /[aiouy]/;
var ends_with_ee = /ee$/;
var whitespace_dash = /\s\-/;
var starts_with_consonant_vowel = /^[^aeiouy][h]?[aeiouy]/;
var joining_consonant_vowel = /^[^aeiou][e]([^d]|$)/;
var cvcv_same_consonant = /^([^aeiouy])[aeiouy]\1[aeiouy]/;
var cvcv_same_vowel = /^[^aeiouy]([aeiouy])[^aeiouy]\1/;
var cvcv_known_consonants = /^([tg][aeiouy]){2}/;
var only_one_or_more_c = /^[^aeiouy]+$/;

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

  // since the open syllable detection is overzealous,
  // sometimes need to rejoin incorrect splits
  if (arr.length > 1) {
    var first_is_open = (arr[0].length === 1 || arr[0].match(starts_with_consonant_vowel)) && arr[0].match(ends_with_vowel);
    var second_is_joining = arr[1].match(joining_consonant_vowel);

    if (first_is_open && second_is_joining) {
      var possible_combination = arr[0] + arr[1];
      var probably_separate_syllables = possible_combination.match(cvcv_same_consonant) || possible_combination.match(cvcv_same_vowel) || possible_combination.match(cvcv_known_consonants);

      if (!probably_separate_syllables) {
        arr[0] = arr[0] + arr[1];
        arr.splice(1, 1);
      }
    }
  }

  if (arr.length > 1) {
    var second_to_last_is_open = arr[arr.length - 2].match(starts_with_consonant_vowel) && arr[arr.length - 2].match(ends_with_vowel);
    var last_is_joining = arr[arr.length - 1].match(joining_consonant_vowel) && ones.every(function (re) {
      return !arr[arr.length - 1].match(re);
    });

    if (second_to_last_is_open && last_is_joining) {
      var _possible_combination = arr[arr.length - 2] + arr[arr.length - 1];
      var _probably_separate_syllables = _possible_combination.match(cvcv_same_consonant) || _possible_combination.match(cvcv_same_vowel) || _possible_combination.match(cvcv_known_consonants);

      if (!_probably_separate_syllables) {
        arr[arr.length - 2] = arr[arr.length - 2] + arr[arr.length - 1];
        arr.splice(arr.length - 1, 1);
      }
    }
  }

  if (arr.length > 1) {
    var single = arr[0] + arr[1];
    if (single.match(starts_with_single_vowel_combos)) {
      arr[0] = single;
      arr.splice(1, 1);
    }
  }

  if (arr.length > 1) {
    if (arr[arr.length - 1].match(only_one_or_more_c)) {
      arr[arr.length - 2] = arr[arr.length - 2] + arr[arr.length - 1];
      arr.splice(arr.length - 1, 1);
    }
  }

  return arr;
}

var syllables = function syllables(str) {
  var all = [];

  if (str.match(' ')) {
    return str.split(all_spaces).map(function (s) {
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
      if (before.match(ends_with_vowel) && !current.match(ends_with_vowel)) {
        if (after.match(starts_with_e_then_specials)) {
          candidate += 'e';
          after = after.replace(starts_with_e, '');
        }
        all.push(candidate);
        return doer(after);
      }

      //unblended vowels ('noisy' vowel combinations)
      if (candidate.match(ends_with_noisy_vowel_combos)) {
        //'io' is noisy, not in 'ion'
        all.push(before);
        all.push(current);
        return doer(after); //recursion
      }

      // if candidate is followed by a CV, assume consecutive open syllables
      if (candidate.match(ends_with_vowel) && after.match(starts_with_consonant_vowel)) {
        all.push(candidate);
        return doer(after);
      }
    }
    //if still running, end last syllable
    if (str.match(aiouy) || str.match(ends_with_ee)) {
      //allow silent trailing e
      all.push(w);
    } else {
      all[all.length - 1] = (all[all.length - 1] || '') + w; //append it to the last one
    }
    return null;
  };

  str.split(whitespace_dash).forEach(function (s) {
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