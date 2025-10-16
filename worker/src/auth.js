// Authentication utilities for Cloudflare Workers using Web Crypto API

const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production'

// Hash password using Web Crypto API
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

// Verify password
export async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

// Create JWT token using Web Crypto API
export async function createToken(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }

  const encoder = new TextEncoder()
  
  // Base64url encode
  const base64url = (str) => {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  const headerEncoded = base64url(JSON.stringify(header))
  const payloadWithExp = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  }
  const payloadEncoded = base64url(JSON.stringify(payloadWithExp))

  // Create signature
  const data = encoder.encode(`${headerEncoded}.${payloadEncoded}`)
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, data)
  const signatureArray = new Uint8Array(signature)
  
  // Convert to base64url manually
  let binary = ''
  for (let i = 0; i < signatureArray.length; i++) {
    binary += String.fromCharCode(signatureArray[i])
  }
  const signatureBase64 = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return `${headerEncoded}.${payloadEncoded}.${signatureBase64}`
}

// Verify JWT token
export async function verifyToken(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const [headerEncoded, payloadEncoded, signatureEncoded] = parts

    // Decode payload
    const payloadJson = atob(
      payloadEncoded
        .replace(/-/g, '+')
        .replace(/_/g, '/')
    )
    const payload = JSON.parse(payloadJson)

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    // Verify signature
    const encoder = new TextEncoder()
    const data = encoder.encode(`${headerEncoded}.${payloadEncoded}`)
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const signatureBase64 = signatureEncoded
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    
    const signatureBinary = atob(signatureBase64)
    const signatureBytes = new Uint8Array(signatureBinary.length)
    for (let i = 0; i < signatureBinary.length; i++) {
      signatureBytes[i] = signatureBinary.charCodeAt(i)
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      data
    )

    if (!isValid) {
      return null
    }

    return payload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}
