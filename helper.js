function findFirstProhibitedWord(message, wordArray) {
  return wordArray.find(word => message.toLowerCase().includes(word)) || null;
}

module.exports = {findFirstProhibitedWord}