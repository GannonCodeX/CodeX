// lib/secure-tokens.js
import crypto from 'crypto'

const SECRET_KEY = process.env.NEXTAUTH_SECRET || process.env.SECRET_KEY || 'fallback-secret-change-in-production'

export function generateSecureToken(data, expiresInHours = 2) {
  const expiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000)
  const tokenPayload = {
    ...data,
    expiresAt,
    nonce: crypto.randomBytes(16).toString('hex'), // Prevent replay attacks
    timestamp: Date.now()
  }

  // Create HMAC signature
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(JSON.stringify(tokenPayload))
    .digest('hex')

  // Combine payload and signature
  const fullToken = {
    payload: tokenPayload,
    signature
  }

  // Base64 encode for URL safety
  return Buffer.from(JSON.stringify(fullToken)).toString('base64url')
}

export function verifySecureToken(token) {
  try {
    if (!token) {
      return { valid: false, error: 'No token provided' }
    }

    // Decode token
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString())
    const { payload, signature } = decoded

    if (!payload || !signature) {
      return { valid: false, error: 'Invalid token format' }
    }

    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return { valid: false, error: 'Token has expired' }
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(JSON.stringify(payload))
      .digest('hex')

    if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'))) {
      return { valid: false, error: 'Invalid token signature' }
    }

    // Return payload data
    return {
      valid: true,
      data: payload,
      expiresAt: new Date(payload.expiresAt).toISOString()
    }

  } catch (error) {
    return { valid: false, error: 'Token verification failed' }
  }
}