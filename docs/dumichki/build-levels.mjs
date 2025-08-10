import dumi_json from './dumi.json' with {type: 'json'};
import fs from 'fs';

const { dumi } = dumi_json;

const five_letters = dumi.filter((word) => word.length === 5);
const LEVEL_COUNT = 1000;

const levels = [];

const is_word_used = (word) => {
  for(const level of levels) {
    if(level.words.includes(word)) {
      return true;
    }
  }
  return false;
}

class Level {

  constructor(words, letters) {
    this.words = words;
    this.letters = letters;
  }
}

while(levels.length < LEVEL_COUNT) {
  console.log("Five letters count:", five_letters.length);
  const final_words = [];
  const target_word = five_letters.pop();

  for(const word of dumi) {
    const target_array = target_word.split('');
    let is_match = true;

    for(const char of word){
      const indexInTarget = target_array.indexOf(char);
      if(indexInTarget >= 0){
        target_array.splice(indexInTarget, 1);
      }else{
        is_match = false;
        break;
      }
    }

    if(is_match && !is_word_used(word)) {
      console.log(`Adding "${word}" to level ${levels.length}`);
      final_words.push(word);
    }
    final_words.filter((word) => !!word);
  }

  final_words.reverse();
  if(final_words.length < 4) {
    for(const word of final_words){
      dumi.splice(0, 0, word);
    }
  }else{
    while(final_words.length > 8) {
      dumi.splice(0, 0, final_words.pop());
    }
    console.log("Creating level", levels.length);
    levels.push(new Level(final_words, target_word.split('')));
  }
}

fs.writeFileSync('./levels.json', JSON.stringify(levels));
