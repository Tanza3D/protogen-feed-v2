export class OsuHelper {
  static isOsu(name: string = '') {
    if(this.isOsuHashtag(name)) return true;
    if (name.toLowerCase().endsWith('osugame')) {
      return true
    }
    if (name.toLowerCase().split('.').includes('osugame')) {
      return true
    }
    if (name.toLowerCase().split('.').includes('osugame')) {
      return true
    }
    return (name.toLowerCase().includes('osugame')
      || name.toLowerCase().includes('osu!')
      || name.toLowerCase().includes('osu!game')
      || name.toLowerCase().includes('osu game'));
  }

  static isOsuStrict(name: string = '') {
    if(this.isOsuHashtag(name)) return true;
    return (name.toLowerCase().includes('osekai.net')
      || name.toLowerCase().includes('osu.ppy')
      || name.toLowerCase().includes('osu!')
      || name.toLowerCase().includes('osu! player')
      || name.toLowerCase().includes('osu!catch')
      || name.toLowerCase().includes('osu!mania')
      || name.toLowerCase().includes('osu!taiko')
      || name.toLowerCase().includes('osu!standard')
      || name.toLowerCase().includes('osucatch')
      || name.toLowerCase().includes('osumania')
      || name.toLowerCase().includes('osutaiko')
      || name.toLowerCase().includes('osustandard')
      || name.toLowerCase().includes('osu! catch')
      || name.toLowerCase().includes('osu! mania')
      || name.toLowerCase().includes('osu! taiko')
      || name.toLowerCase().includes('osu! standard')
      || name.toLowerCase().includes('osu!std')
      || name.toLowerCase().includes('osu! std')
      || name.toLowerCase().includes(' proots '));
  }

  static isOsuHashtag(name: string = '') {
    return (name.toLowerCase().includes('#osu')
      || name.toLowerCase().includes('#osugame'));
  }


  static generalCheck(name = '') {
    // List of furry-related terms
    const furryRelated = [
      'furry', 'furryart', 'proto', 'beep', 'fanart', 'ych', 'blahaj', 'furries',
      'fursuit', 'fursuiter', 'gay', 'trans', 'snoot', 'doodle', 'x3', ':3', 'owo',
      'uwu', 'cute', 'fox', 'wolf', 'adhd', 'anthro', 'boop', 'blender', 'vrchat',
      'doggo', 'cutie', 'woof', 'meow', 'roomba', 'toaster', '>w<', '^w^', '^^',
      '^ ^', 'rawr', 'sona', ' vr ', 'protogen', 'beeper', 'fluffy', 'visor',
      'computer', 'unity', 'porn', 'sexy', 'cutes', 'code', 'sfw', 'nsfw',
      'suit', '#proto', '#protogen', '#furry', '#furryart',
      'vore', 'inflation', 'yiff', 'cum', 'e6' // ok lets be fair
    ]

    const lowercasedName = name.toLowerCase()
    const matches = furryRelated.filter(term => lowercasedName.includes(term))
    return matches
  }

}