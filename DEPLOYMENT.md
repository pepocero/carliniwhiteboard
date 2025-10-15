# 🚀 Guía de Despliegue - Carlini Whiteboard

Esta guía te ayudará a desplegar Carlini Whiteboard en Cloudflare usando Workers, Pages y D1.

## 📋 Prerrequisitos

### Herramientas Necesarias
- [Node.js](https://nodejs.org/) 18+ instalado
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) instalado
- Cuenta de [Cloudflare](https://cloudflare.com) con Workers habilitado

### Instalar Wrangler
```bash
npm install -g wrangler
```

## 🔧 Configuración Inicial

### 1. Autenticar con Cloudflare
```bash
wrangler login
```

### 2. Crear Base de Datos D1
```bash
# Crear la base de datos
wrangler d1 create carlini-whiteboard-db

# Nota: Guarda el database_id que se muestra en la salida
```

### 3. Configurar Variables de Entorno
Actualiza `worker/wrangler.toml` con tu database_id:
```toml
[[d1_databases]]
binding = "DB"
database_name = "carlini-whiteboard-db"
database_id = "tu-database-id-aqui"
```

## 🗄️ Configuración de Base de Datos

### 1. Aplicar Esquema
```bash
cd worker
wrangler d1 execute carlini-whiteboard-db --file=./schema.sql
```

### 2. Verificar Instalación
```bash
# Verificar que las tablas se crearon correctamente
wrangler d1 execute carlini-whiteboard-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

## 🏗️ Despliegue del Backend (Worker)

### 1. Instalar Dependencias del Worker
```bash
cd worker
npm install
```

### 2. Desplegar Worker
```bash
# Desplegar a producción
wrangler deploy

# O desplegar a un entorno específico
wrangler deploy --env production
```

### 3. Verificar Despliegue
```bash
# Probar el endpoint
curl https://tu-worker.tu-subdominio.workers.dev/api/whiteboards
```

## 🎨 Despliegue del Frontend (Pages)

### 1. Construir Frontend
```bash
# Desde la raíz del proyecto
npm install
npm run build
```

### 2. Desplegar a Cloudflare Pages

#### Opción A: Usando Wrangler
```bash
# Desplegar directamente
wrangler pages deploy dist --project-name carlini-whiteboard

# O con configuración específica
wrangler pages deploy dist --project-name carlini-whiteboard --compatibility-date 2024-01-01
```

#### Opción B: Usando Dashboard de Cloudflare
1. Ve a [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Selecciona "Pages" en el menú lateral
3. Click en "Create a project"
4. Conecta tu repositorio de GitHub/GitLab
5. Configura:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`

### 3. Configurar Variables de Entorno
En el dashboard de Cloudflare Pages:
1. Ve a tu proyecto
2. Settings > Environment variables
3. Agregar:
   - `VITE_API_URL`: URL de tu Worker (ej: `https://tu-worker.tu-subdominio.workers.dev`)

## 🔗 Configuración de Dominio Personalizado

### 1. Configurar DNS
En tu proveedor de DNS:
```
# Para el frontend
CNAME www -> carlini-whiteboard.pages.dev
CNAME @ -> carlini-whiteboard.pages.dev

# Para la API (opcional)
CNAME api -> tu-worker.tu-subdominio.workers.dev
```

### 2. Configurar en Cloudflare
1. **Frontend (Pages)**:
   - Ve a tu proyecto en Pages
   - Settings > Custom domains
   - Agregar tu dominio personalizado

2. **Backend (Worker)**:
   - Ve a tu Worker
   - Settings > Triggers
   - Agregar Custom domain

## 🔒 Configuración de Seguridad

### 1. CORS Configuration
El Worker ya incluye headers CORS básicos. Para producción, actualiza:
```javascript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://tu-dominio.com', // Específico en lugar de '*'
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
```

### 2. Rate Limiting
Agregar rate limiting al Worker:
```javascript
// En worker/src/index.js
const rateLimiter = {
  async check(env, ip) {
    const key = `rate_limit:${ip}`
    const count = await env.KV.get(key) || 0
    if (count > 100) { // 100 requests per hour
      return false
    }
    await env.KV.put(key, count + 1, { expirationTtl: 3600 })
    return true
  }
}
```

## 📊 Monitoreo y Analytics

### 1. Cloudflare Analytics
- **Workers Analytics**: Disponible en el dashboard de Cloudflare
- **Pages Analytics**: Métricas de tráfico y rendimiento

### 2. Logs y Debugging
```bash
# Ver logs del Worker en tiempo real
wrangler tail

# Ver logs específicos
wrangler tail --format pretty
```

## 🔄 Actualizaciones y Mantenimiento

### 1. Actualizar Worker
```bash
cd worker
# Hacer cambios en el código
wrangler deploy
```

### 2. Actualizar Frontend
```bash
# Hacer cambios en el código
npm run build
wrangler pages deploy dist --project-name carlini-whiteboard
```

### 3. Actualizar Base de Datos
```bash
# Crear nueva migración
wrangler d1 migrations create carlini-whiteboard-db "add new column"

# Aplicar migración
wrangler d1 migrations apply carlini-whiteboard-db
```

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Error de CORS
```bash
# Verificar headers CORS en el Worker
curl -H "Origin: https://tu-dominio.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://tu-worker.tu-subdominio.workers.dev/api/whiteboards
```

#### 2. Base de Datos No Encontrada
```bash
# Verificar que la base de datos existe
wrangler d1 list

# Verificar binding en wrangler.toml
cat worker/wrangler.toml
```

#### 3. Frontend No Carga
```bash
# Verificar build
ls -la dist/

# Verificar configuración de Pages
wrangler pages project list
```

### Logs de Debug
```bash
# Worker logs
wrangler tail --format pretty

# Pages logs (en dashboard)
# Cloudflare Dashboard > Pages > tu-proyecto > Functions > Logs
```

## 📈 Optimización de Rendimiento

### 1. Frontend
- **Code Splitting**: Implementar lazy loading de componentes
- **Caching**: Configurar headers de cache apropiados
- **CDN**: Cloudflare Pages incluye CDN global

### 2. Backend
- **Caching**: Implementar cache en KV para consultas frecuentes
- **Compression**: Habilitar compresión gzip
- **Edge Computing**: Workers se ejecutan en el edge

### 3. Base de Datos
- **Índices**: Asegurar que las consultas usen índices
- **Paginación**: Implementar paginación para listas grandes
- **Connection Pooling**: D1 maneja esto automáticamente

## 🔐 Backup y Recuperación

### 1. Backup de Base de Datos
```bash
# Exportar datos
wrangler d1 execute carlini-whiteboard-db --command="SELECT * FROM whiteboards;" --output=json > backup.json

# Backup completo
wrangler d1 export carlini-whiteboard-db --output=backup.sql
```

### 2. Restaurar desde Backup
```bash
# Restaurar desde SQL
wrangler d1 execute carlini-whiteboard-db --file=backup.sql
```

## 📞 Soporte

### Recursos Útiles
- [Documentación de Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Documentación de Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Documentación de Cloudflare D1](https://developers.cloudflare.com/d1/)

### Contacto
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/carlini-whiteboard/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/tu-usuario/carlini-whiteboard/discussions)

---

**¡Tu Carlini Whiteboard está listo para usar! 🎉**
