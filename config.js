const prohibitedWords = [
  // 🔞 Explicit or Sexual Content
  'porn', 'xxx', 'sex', 'blowjob', 'anal', 'dildo', 'pussy', 'tits', 'boobs', 'nude', 'nudes', 'horny',
  'camgirl', 'camsex', 'gangbang', 'hentai', 'sexcam', 'cum', 'orgasm', 'fetish', 'bdsm', 'bdsmplay',
  'sexting', 'sextape', 'strip', 'stripper', 'fuck', 'fap', 'jerkoff', 'handjob', 'masturbation',
  'erection', 'intercourse', 'coitus', 'genital', 'vagina', 'penis', 'ejaculation', 'sperm', 'balls',
  'incest', 'sexchat', 'deepthroat',

  // 💣 Violence & Gore
  'kill', 'murder', 'stab', 'shoot', 'rape', 'behead', 'bomb', 'gun', 'blood', 'slaughter', 'massacre',
  'assault', 'abuse', 'hang', 'lynch', 'mutilate', 'decapitate', 'terrorism', 'execute', 'homicide', 'genocide',

  // 💀 Hate Speech / Racism / Discrimination
  'nigger', 'nigga', 'chink', 'spic', 'faggot', 'fag', 'tranny', 'retard', 'kike', 'towelhead', 'terrorist',
  'sandnigger', 'honkey', 'cracker', 'gook', 'wetback', 'dyke', 'monkey', 'slope', 'coon',

  // 😡 Harassment / Bullying
  'die', 'suicide', 'killyourself', 'kys', 'loser', 'worthless', 'nobodylikesyou', 'freak', 'ugly', 'idiot',
  'moron', 'imbecile', 'hateyou', 'stupid', 'dumbass', 'clown', 'trash', 'waste',

  // 🌐 Spam / Scam / Ads
  'free nitro', 'discord nitro hack', 'click here', 'earn money fast', 'join now', 'win free',
  'cheap followers', 'buy likes', 'subscribe now', 'invest crypto', 'forex trade', 'nft pump',
  'fake giveaway', 'get rich quick',

  // 🧨 Profanity / Swearing
  'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'dick', 'cock', 'cunt', 'slut', 'whore',
  'piss', 'bullshit', 'motherfucker', 'goddamn',

  // 🚷 Drugs / Illegal Substances
  'weed', 'marijuana', 'cocaine', 'heroin', 'meth', 'lsd', 'ecstasy', 'mdma', 'crack', 'opium',
  'ketamine', 'dope', 'tripping', 'highaf', 'stoned', 'xanax', 'molly', 'acid', 'joint', 'blunt', 'bong'
];

module.exports = {prohibitedWords}