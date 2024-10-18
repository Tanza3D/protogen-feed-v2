export class OsuHelper {
  static isOsu(name: string = '') {
    if (this.isOsuHashtag(name)) return true
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
      || name.toLowerCase().includes('osu game'))
  }

  static isOsuStrict(name: string = '') {
    if (this.isOsuHashtag(name)) return true
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
      || name.toLowerCase().includes('osu! std'))
  }

  static isOsuHashtag(name: string = '') {
    return (name.toLowerCase().includes('#osu')
      || name.toLowerCase().includes('#osugame'))
  }


  static generalCheck(name = '') {
    // List of furry-related terms
    const furryRelated = [
      'cookiezi', 'blue zenith', 'sidetracked day', 'mrekk', 'cloutiful', '727',
      'wysi', 'when you see it', 'scarlet rose', 'mapping', 'mapper', 'mappers',
      'honesty', 'gyze', 'will stetson', 'harumachi clover', 'padoru padoru',
      'worst hr player', 'whitecat', 'sound chimera', 'godmode', 'ghost rule',
      'mili', 'tuyu ', 'make a move', 'sotarks', 'vinxis', 'peppy', 'nekodex',
      'quaver', 'world cup', 'tournament', 'beatmap', 'beatmap spotlights',
      'project loved', 'bn ', 'nat', 'featured artist', 'kudosu',
      'score', 'ss ', 's rank', 'pp ', 'combo', 'medal', 'achievement',
      'osu', 'osugame', 'dean', 'gaming', 'play', 'hard rock', 'hdhr',
      'hdhrdt', 'hddt', 'hrdt', 'dt ', 'double time'
    ]

    const lowercasedName = name.toLowerCase()
    const matches = furryRelated.filter(term => lowercasedName.includes(term))
    return matches
  }

}