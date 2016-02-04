turning words into their syllables

```javascript
var nlp = require('nlp_compromise');
var nlpSyllables = require('nlp-syllables');

nlp.plugin(nlpSyllables);
var t2 = nlp.term('houston texas');
t2.syllables();
//[ [ 'hous', 'ton' ], [ 'tex', 'as' ] ]
```