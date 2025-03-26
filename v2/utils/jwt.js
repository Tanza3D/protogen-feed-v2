import { verifyJwt } from '@atproto/xrpc-server'
import { IdResolver } from '@atproto/identity'

const idResolver = new IdResolver()
const cache = new Map() // In-memory cache

const getSigningKey = async (did) => {
    return idResolver.did.resolveAtprotoKey(did)
}

export async function validateAuth(req) {
    const authHeader = req.headers['authorization']
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('Invalid or missing Authorization header')
    }

    const jwt = authHeader.slice(7).trim()

    // Check if cached JWT is still valid
    const cached = cache.get(jwt)
    if (cached && Date.now() - cached.timestamp < 20000) {
        // If the cached payload is still valid, return the cached DID
        return cached.userDid
    }

    try {
        const payload = await verifyJwt(
            jwt,
            null,
            null,
            getSigningKey,
        )

        const userDid = payload.iss

        // Cache the result with a timestamp
        cache.set(jwt, { userDid, timestamp: Date.now() })

        return userDid
    } catch (error) {
        console.error('JWT verification failed:', error)
        throw new Error('Invalid JWT or unauthorized')
    }
}
