export class FurryHelper {
  static isProtogen(name: string = '') {
    if (name.toLowerCase().endsWith('proot')) {
      return true
    }
    if (name.toLowerCase().split('.').includes('proot')) {
      return true
    }
    if (name.toLowerCase().split('.').includes('protogen')) {
      return true
    }
    return (name.toLowerCase().includes(' protogen')
      || name.toLowerCase().includes('protogen ')
      || name.toLowerCase().includes(' protogens')
      || name.toLowerCase().includes('protogens ')
      || name.toLowerCase().includes('protogen')
      || name.toLowerCase().includes('protogens')
      || name.toLowerCase().includes('protogenfeed')
      || name.toLowerCase().includes(' proot')
      || name.toLowerCase().includes(' proots')
      || name.toLowerCase().includes(' proot ')
      || name.toLowerCase().includes(' proots ')
      || ((name.toLowerCase().includes('protogen') || name.toLowerCase().includes('proot')) && name.toLowerCase().includes('furry')))
  }

  static isProtogenStrict(name: string = '') {
    return (name.toLowerCase().includes(' protogen ')
      || name.toLowerCase().includes(' protogens ')
      || name.toLowerCase().includes('protogenfeed')
      || name.toLowerCase().includes('im a protogen')
      || name.toLowerCase().includes('protogen ')
      || name.toLowerCase().includes(' protogen')
      || name.toLowerCase().includes(' proot ')
      || name.toLowerCase().includes(' proots ')
      || ((name.toLowerCase().includes('protogen') || name.toLowerCase().includes('proot')) && name.toLowerCase().includes('furry')))
  }

  static isProtogenTag(name: string = '') {
    return (name.toLowerCase().includes('#protogen')
      || name.toLowerCase().includes('#proot')
      || name.toLowerCase().includes('#protogenfeed')
      || name.toLowerCase().includes('#protogenfeedbsky'))
  }


  static isFurry(name = '') {
    // List of furry-related terms
    const furryRelated = [
      'furry', 'furryart', 'proto', 'beep', 'fanart', 'ych', 'blahaj', 'furries',
      'fursuit', 'fursuiter', 'gay', 'trans', 'snoot', 'doodle', 'x3', ':3', 'owo',
      'uwu', 'cute', 'fox', 'wolf', 'adhd', 'anthro', 'boop', 'blender', 'vrchat',
      'doggo', 'cutie', 'woof', 'meow', 'roomba', 'toaster', '>w<', '^w^', '^^',
      '^ ^', 'rawr', 'sona', ' vr ', 'protogen', 'beeper', 'fluffy', 'visor',
      'computer', 'unity', 'porn', 'sexy', 'cutes', 'code', 'sfw', 'nsfw',
      'suit',
      'vore', 'inflation', 'yiff', 'cum', 'e6' // ok lets be fair
    ]

    const lowercasedName = name.toLowerCase()
    const matches = furryRelated.filter(term => lowercasedName.includes(term))
    return matches
  }

}