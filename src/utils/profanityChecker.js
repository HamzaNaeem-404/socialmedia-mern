import BadWords from 'bad-words';

const profanityChecker = new BadWords();
profanityChecker.addWords(['bad', 'word', 'here']);

export default profanityChecker;