export class FurryHelper {
  static isProtogen(name: string = ''): boolean {
    const lowerName = name.toLowerCase();
    const keywords = [
      ' protogen',
      'protogen ',
      ' protogens',
      'protogens ',
      'protogen',
      'protosona',
      'protogenfeed',
      ' proot',
      '#protogen',
      ' proots',
      ' proot ',
      ' proots '
    ];

    const splitKeywords = ['proot', 'protogen'];

    if (this.isProtogenTag(name)) return true;

    if (lowerName.endsWith('proot')) return true;

    if (splitKeywords.some(keyword => lowerName.split('.').includes(keyword))) {
      return true;
    }

    return (
      keywords.some(keyword => lowerName.includes(keyword)) ||
      (splitKeywords.some(keyword => lowerName.includes(keyword)) && lowerName.includes('furry'))
    );
  }

  static isProtogenStrict(name: string = ''): boolean {
    const lowerName = name.toLowerCase();
    const strictKeywords = [
      ' protogen ',
      ' protogens ',
      'protogenfeed',
      'im a protogen',
      'protogen ',
      '#protogen',
      ' protogen',
      ' protosona',
      ' proot ',
      ' proots '
    ];

    if (this.isProtogenTag(name)) return true;

    return (
      strictKeywords.some(keyword => lowerName.includes(keyword)) ||
      ((lowerName.includes('protogen') || lowerName.includes('proot')) && lowerName.includes('furry'))
    );
  }

  static isProtogenTag(name: string = ''): boolean {
    const tags = ['#protogen', '#proot', '#protogenfeed', '#protogenfeedbsky'];
    return tags.some(tag => name.toLowerCase().includes(tag));
  }



  static isFurry(name = '') {
    // List of furry-related terms
    const furryRelated = [
      'furry', 'furryart', 'proto', 'beep', 'fanart', 'ych', 'blahaj', 'furries',
      'fursuit', 'fursuiter', 'gay', 'trans', 'snoot',
      'adhd', 'anthro', 'boop', 'blender', 'vrchat',
      'doggo', 'cutie', 'woof', 'meow', 'roomba', 'toaster',
      '^ ^', 'rawr', 'sona', ' vr ', 'protogen', 'beeper', 'fluffy', 'visor',
      'computer', 'unity', 'porn', 'sexy', 'cutes', 'protosona',
      'suit', '#proto', '#protogen', '#furry', '#furryart',
      'vore', 'inflation', 'yiff', 'cum', 'e6' // ok lets be fair
    ]

    const lowercasedName = name.toLowerCase()
    const matches = furryRelated.filter(term => lowercasedName.includes(term))
    return matches
  }

  static isArt(text) {
    const hashtags = ['#art', '#furryart', '#protogenart', '#myart', '#ocart'];
    return hashtags.some(tag => text.toLowerCase().includes(tag));
  }
}