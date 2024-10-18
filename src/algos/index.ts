import { AppContext } from '../config'
import {
  QueryParams,
  OutputSchema as AlgoOutput,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import * as protogenFeed from './protogenFeed'
import * as osuFeed from './osuFeed'

type AlgoHandler = (ctx: AppContext, params: QueryParams) => Promise<AlgoOutput>

const algos: Record<string, AlgoHandler> = {
  [protogenFeed.shortname]: protogenFeed.handler,
  [osuFeed.shortname]: osuFeed.handler,
}

export default algos
