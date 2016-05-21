//chop a string into pronounced syllables
'use strict';

const ones = [
  /^[^aeiou]?ion/,
  /^[^aeiou]?ised/,
  /^[^aeiou]?iled/,

  // -ing, -ent
  /[aeiou][n][gt]$/,

  // -ate, -age
  /\wa[gt]e$/,
];
const all_spaces = / /g;
const ends_with_vowel = /[aeiouy]$/;
const starts_with_e_then_specials = /^e[sm]/;
const starts_with_e = /^e/;
const ends_with_noisy_vowel_combos = /(eo|eu|ia|oa|ua|ui)$/i;
const aiouy = /[aiouy]/;
const ends_with_ee = /ee$/;
const whitespace_dash = /\s\-/;
const starts_with_consonant_vowel = /^[^aeiouy][h]?[aeiouy]/;
const joining_consonant_vowel = /^[^aeiou][e]([^d]|$)/;

//suffix fixes
function postprocess(arr) {
  //trim whitespace
  arr = arr.map(function(w) {
    return w.trim();
  });
  arr = arr.filter(function(w) {
    return w !== '';
  });
  // if (arr.length > 2) {
  //   return arr;
  // }

  const l = arr.length;
  if (l > 1) {
    const suffix = arr[l - 2] + arr[l - 1];
    for (let i = 0; i < ones.length; i++) {
      if (suffix.match(ones[i])) {
        arr[l - 2] = arr[l - 2] + arr[l - 1];
        arr.pop();
      }
    }
  }

  // since the open syllable detection is overzealous,
  // sometimes need to rejoin incorrect splits
  if (arr.length > 1) {
    let first_is_open = (arr[0].length == 1 || arr[0].match(starts_with_consonant_vowel)) && arr[0].match(ends_with_vowel);
    let second_is_joining = arr[1].match(joining_consonant_vowel);

    if (first_is_open && second_is_joining) {
      arr[0] = arr[0] + arr[1];
      arr.splice(1,1);
    }
  }
  return arr;
}

const syllables = function(str) {
  let all = [];

  if (str.match(' ')) {
    return str.split(all_spaces).map(function(s) {
      return syllables(s);
    });
  }

  //method is nested because it's called recursively
  const doer = function(w) {
    const chars = w.split('');
    let before = '';
    let after = '';
    let current = '';
    for (let i = 0; i < chars.length; i++) {
      before = chars.slice(0, i).join('');
      current = chars[i];
      after = chars.slice(i + 1, chars.length).join('');
      let candidate = before + chars[i];

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
      if (candidate.match(ends_with_noisy_vowel_combos)) { //'io' is noisy, not in 'ion'
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
    if (str.match(aiouy) || str.match(ends_with_ee)) { //allow silent trailing e
      all.push(w);
    } else {
      all[all.length - 1] = (all[all.length - 1] || '') + w; //append it to the last one
    }
  };

  str.split(whitespace_dash).forEach(function(s) {
    doer(s);
  });
  all = postprocess(all);

  //for words like 'tree' and 'free'
  if (all.length === 0) {
    all = [str];
  }
  //filter blanks
  all = all.filter(function(s) {
    return s !== '' && s !== null && s !== undefined;
  });

  return all;
};

// console.log(syllables('civilised'));

module.exports = syllables;
