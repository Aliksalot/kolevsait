import dumi_json from './dumi.json' with {type: 'json'};
import fs from 'fs';

const { dumi } = dumi_json;
console.log(dumi);

const five_letters = dumi.filter((word) => word.length === 5);

const levels = [];

class Level {

  constructor(words, letters) {
    this.words = words;
    this.letters = letters;
  }
}

for(let i = 0; i < 10; i ++) {
  const final_words = [];
  const target_word = five_letters[Math.floor(Math.random() * five_letters.length)];

  for(const word of dumi) {
    //console.log();
    const target_array = target_word.split('');
    let is_match = true;

    for(const char of word){
      const indexInTarget = target_array.indexOf(char);
      if(indexInTarget >= 0){
        //console.log(`Found ${char} of ${word} in ${target_array} @ ${indexInTarget}`);
        target_array.splice(indexInTarget, 1);
      }else{
        //console.log(`Didnt find ${char} of ${word} in ${target_array}`);
        is_match = false;
        break;
      }
    }

    if(is_match) {
      final_words.push(word);
    }
  }

  levels.push(new Level(final_words, target_word.split('')));
}

fs.writeFileSync('./levels.json', JSON.stringify(levels));
