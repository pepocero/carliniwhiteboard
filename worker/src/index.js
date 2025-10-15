// Cloudflare Worker for Carlini Whiteboard API with JWT Authentication
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    // Handle preflight requests
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // Route handling
      if (path.startsWith('/api/auth')) {
        return await handleAuth(request, env, corsHeaders)
      } else if (path.startsWith('/api/whiteboards')) {
        return await handleWhiteboards(request, env, corsHeaders)
      } else if (path.startsWith('/api/users')) {
        return await handleUsers(request, env, corsHeaders)
      } else {
        return new Response('Not Found', { 
          status: 404, 
          headers: corsHeaders 
        })
      }
    } catch (error) {
      console.error('Worker error:', error)
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }
}

// JWT Secret (in production, use env.JWT_SECRET)
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production'

// Handle authentication endpoints
async function handleAuth(request, env, corsHeaders) {
  const url = new URL(request.url)
  const path = url.pathname
  const method = request.method

  // Extract auth action from path
  const pathParts = path.split('/')
  const action = pathParts.length > 3 ? pathParts[3] : null

  switch (method) {
    case 'POST':
      if (action === 'register') {
        return await register(request, env, corsHeaders)
      } else if (action === 'login') {
        return await login(request, env, corsHeaders)
      } else if (action === 'logout') {
        return await logout(request, env, corsHeaders)
      }
      break
    
    case 'GET':
      if (action === 'me') {
        return await getCurrentUser(request, env, corsHeaders)
      }
      break
  }

  return new Response('Method Not Allowed', { 
    status: 405, 
    headers: corsHeaders 
  })
}

// Register a new user
async function register(request, env, corsHeaders) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate input
    if (!email || !password) {
      return new Response(JSON.stringify({ 
        error: 'Email and password are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user already exists
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()

    if (existingUser) {
      return new Response(JSON.stringify({ 
        error: 'User already exists' 
      }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)
    const userId = generateId()
    const now = new Date().toISOString()

    // Create user
    await env.DB.prepare(`
      INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(userId, email, passwordHash, name || email, now, now).run()

    // Generate JWT token
    const token = jwt.sign(
      { userId, email, name: name || email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return new Response(JSON.stringify({
      success: true,
      user: { id: userId, email, name: name || email },
      token
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error registering user:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to register user' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Login user
async function login(request, env, corsHeaders) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return new Response(JSON.stringify({ 
        error: 'Email and password are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Find user
    const user = await env.DB.prepare(
      'SELECT id, email, password_hash, name FROM users WHERE email = ?'
    ).bind(email).first()

    if (!user) {
      return new Response(JSON.stringify({ 
        error: 'Invalid credentials' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return new Response(JSON.stringify({ 
        error: 'Invalid credentials' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return new Response(JSON.stringify({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      token
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error logging in user:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to login' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Logout user (client-side token removal)
async function logout(request, env, corsHeaders) {
  return new Response(JSON.stringify({
    success: true,
    message: 'Logged out successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Get current user info
async function getCurrentUser(request, env, corsHeaders) {
  try {
    const user = await verifyToken(request, env)
    if (!user) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      user: { id: user.userId, email: user.email, name: user.name }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error getting current user:', error)
    return new Response(JSON.stringify({ 
      error: 'Failed to get user info' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Verify JWT token
async function verifyToken(request, env) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

// Handle whiteboards endpoints
async function handleWhiteboards(request, env, corsHeaders) {
  const url = new URL(request.url)
  const path = url.pathname
  const method = request.method

  // Verify authentication
  const user = await verifyToken(request, env)
  if (!user) {
    return new Response(JSON.stringify({ 
      error: 'Unauthorized' 
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Extract whiteboard ID from path
  const pathParts = path.split('/')
  const whiteboardId = pathParts.length > 3 ? pathParts[3] : null

  switch (method) {
    case 'GET':
      if (whiteboardId) {
        return await getWhiteboard(whiteboardId, user.userId, env, corsHeaders)
      } else {
        return await getWhiteboards(user.userId, env, corsHeaders)
      }
    
    case 'POST':
      return await createWhiteboard(request, user.userId, env, corsHeaders)
    
    case 'PUT':
      if (whiteboardId) {
        return await updateWhiteboard(whiteboardId, request, user.userId, env, corsHeaders)
      }
      break
    
    case 'DELETE':
      if (whiteboardId) {
        return await deleteWhiteboard(whiteboardId, user.userId, env, corsHeaders)
      }
      break
  }

  return new Response('Method Not Allowed', { 
    status: 405, 
    headers: corsHeaders 
  })
}

// Get all whiteboards for a user
async function getWhiteboards(userId, env, corsHeaders) {
  try {
    const stmt = env.DB.prepare(`
      SELECT id, user_id, name, data, created_at, updated_at 
      FROM whiteboards 
      WHERE user_id = ? 
      ORDER BY updated_at DESC
    `)
    
    const result = await stmt.bind(userId).all()
    
    return new Response(JSON.stringify(result.results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error getting whiteboards:', error)
    return new Response(JSON.stringify({ error: 'Failed to get whiteboards' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Get a specific whiteboard
async function getWhiteboard(id, userId, env, corsHeaders) {
  try {
    const stmt = env.DB.prepare(`
      SELECT id, user_id, name, data, created_at, updated_at 
      FROM whiteboards 
      WHERE id = ? AND user_id = ?
    `)
    
    const result = await stmt.bind(id, userId).first()
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Whiteboard not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error getting whiteboard:', error)
    return new Response(JSON.stringify({ error: 'Failed to get whiteboard' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Create a new whiteboard
async function createWhiteboard(request, userId, env, corsHeaders) {
  try {
    const body = await request.json()
    const { name, data } = body
    
    const id = generateId()
    const now = new Date().toISOString()
    
    const stmt = env.DB.prepare(`
      INSERT INTO whiteboards (id, user_id, name, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    
    await stmt.bind(id, userId, name, data, now, now).run()
    
    const whiteboard = {
      id,
      user_id: userId,
      name,
      data,
      created_at: now,
      updated_at: now
    }
    
    return new Response(JSON.stringify(whiteboard), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error creating whiteboard:', error)
    return new Response(JSON.stringify({ error: 'Failed to create whiteboard' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Update a whiteboard
async function updateWhiteboard(id, request, userId, env, corsHeaders) {
  try {
    const body = await request.json()
    const { name, data } = body
    const now = new Date().toISOString()
    
    const stmt = env.DB.prepare(`
      UPDATE whiteboards 
      SET name = ?, data = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `)
    
    const result = await stmt.bind(name, data, now, id, userId).run()
    
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Whiteboard not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    // Get the updated whiteboard
    const getStmt = env.DB.prepare(`
      SELECT id, user_id, name, data, created_at, updated_at 
      FROM whiteboards 
      WHERE id = ? AND user_id = ?
    `)
    
    const whiteboard = await getStmt.bind(id, userId).first()
    
    return new Response(JSON.stringify(whiteboard), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error updating whiteboard:', error)
    return new Response(JSON.stringify({ error: 'Failed to update whiteboard' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Delete a whiteboard
async function deleteWhiteboard(id, userId, env, corsHeaders) {
  try {
    const stmt = env.DB.prepare('DELETE FROM whiteboards WHERE id = ? AND user_id = ?')
    const result = await stmt.bind(id, userId).run()
    
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Whiteboard not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error deleting whiteboard:', error)
    return new Response(JSON.stringify({ error: 'Failed to delete whiteboard' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

// Handle users endpoints
async function handleUsers(request, env, corsHeaders) {
  const method = request.method

  // Verify authentication
  const user = await verifyToken(request, env)
  if (!user) {
    return new Response(JSON.stringify({ 
      error: 'Unauthorized' 
    }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  switch (method) {
    case 'GET':
      // Return current user info
      return new Response(JSON.stringify({ 
        id: user.userId,
        email: user.email,
        name: user.name
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    
    default:
      return new Response('Method Not Allowed', { 
        status: 405, 
        headers: corsHeaders 
      })
  }
}

// Generate a unique ID
function generateId() {
  return 'wb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}