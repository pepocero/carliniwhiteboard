# 🚀 Carlini Whiteboard - Guía de Inicio

## 📋 Requisitos Previos

- Node.js 18 o superior
- NPM o Yarn
- Cuenta de Cloudflare (para producción)

## 🛠️ Instalación y Desarrollo Local

### 1. Instalar Dependencias

**Frontend:**
```bash
npm install
```

**Worker (Backend):**
```bash
cd worker
npm install
```

### 2. Inicializar la Base de Datos (solo la primera vez)

```bash
cd worker
npx wrangler d1 execute carlini-whiteboard-db --local --file=schema.sql
```

### 3. Iniciar el Servidor de Desarrollo

**Opción A: Ejecutar ambos servicios en terminales separadas**

Terminal 1 - Frontend:
```bash
npm run dev
```

Terminal 2 - Worker:
```bash
cd worker
npx wrangler dev --persist-to=.wrangler/state
```

**Nota**: El flag `--persist-to` crea una base de datos SQLite local para desarrollo.

**Opción B: Usar el script de desarrollo completo (si existe)**
```bash
npm run dev:all
```

### 3. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Worker API**: http://127.0.0.1:8787

## 🎯 Primeros Pasos

### Crear tu Primera Cuenta

1. Abre http://localhost:3000 en tu navegador
2. Haz clic en "Registrarse" o "Comenzar Gratis"
3. Completa el formulario con:
   - **Nombre**: Tu nombre
   - **Email**: tu@email.com
   - **Contraseña**: Mínimo 6 caracteres
4. ¡Listo! Serás redirigido automáticamente a la aplicación

### Crear tu Primer Tablero

1. Una vez autenticado, haz clic en "Nuevo" en el header
2. Se creará automáticamente un tablero vacío
3. Usa las herramientas de la barra lateral izquierda:
   - **Seleccionar**: Mover y seleccionar elementos
   - **Lápiz**: Dibujar a mano alzada
   - **Borrador**: Eliminar elementos
   - **Texto**: Agregar texto
   - **Formas**: Rectángulos, círculos, líneas
   - **Nota Adhesiva**: Crear sticky notes

### Crear Tarjetas Automáticamente

1. Expande la sección "Crear Tarjetas" en la barra lateral
2. Escribe tu texto en el campo de texto
3. Elige un separador (por defecto: coma)
4. Selecciona el color de las tarjetas
5. Haz clic en "Crear Tarjetas"

Ejemplo:
```
Texto: "Tarea 1, Tarea 2, Tarea 3, Tarea 4"
Separador: ","
Resultado: 4 tarjetas coloridas con cada tarea
```

## 🔐 Autenticación

### Sistema de Seguridad

- **JWT Tokens**: Expiran en 7 días
- **Contraseñas**: Hasheadas con bcrypt
- **Multitenant**: Cada usuario solo ve sus tableros
- **Headers**: Todas las peticiones incluyen `Authorization: Bearer <token>`

### Cerrar Sesión

1. Haz clic en tu nombre en el header
2. Selecciona "Cerrar Sesión"
3. Serás redirigido a la página de inicio

## 📚 Características Principales

### ✏️ Herramientas de Dibujo

- **Lápiz**: Dibuja trazos libres
- **Formas**: Rectángulos, círculos, líneas
- **Texto**: Haz doble clic para editar
- **Sticky Notes**: Notas adhesivas con colores personalizables
- **Borrador**: Elimina elementos con un clic

### 🎨 Personalización

- **Colores**: Elige el color de trazo y relleno
- **Grosor**: Ajusta el grosor de líneas
- **Tamaño de Fuente**: Personaliza el texto
- **Zoom**: Acerca y aleja el canvas

### 💾 Guardado Automático

- Los cambios se guardan automáticamente cada pocos segundos
- No necesitas hacer clic en "Guardar" manualmente
- El estado se muestra en el header: "Guardando..." → "Guardado hace X minutos"

### 🎯 Bring to Front

- Haz clic en cualquier elemento para traerlo al frente
- Los elementos se apilan automáticamente según el orden de selección

## 🌐 Despliegue en Producción

### Configurar Cloudflare

1. **Crear base de datos D1:**
```bash
cd worker
npx wrangler d1 create carlini-whiteboard-db
```

2. **Actualizar wrangler.toml:**
```toml
[[d1_databases]]
binding = "DB"
database_name = "carlini-whiteboard-db"
database_id = "TU-DATABASE-ID-AQUI"
```

3. **Aplicar el esquema:**
```bash
npx wrangler d1 execute carlini-whiteboard-db --file=schema.sql
```

4. **Desplegar el Worker:**
```bash
npx wrangler deploy
```

5. **Desplegar el Frontend:**
```bash
npm run build
npx wrangler pages deploy dist
```

### Variables de Entorno

**Producción (Worker):**
- `JWT_SECRET`: Cambiar el secreto en `worker/src/index.js` (línea 53)
- Usar variables de entorno de Cloudflare para mayor seguridad

**Frontend:**
- Las URLs de API se configuran automáticamente según el entorno

## 🐛 Solución de Problemas

### Error: "Unauthorized"
- Verifica que hayas iniciado sesión
- El token puede haber expirado, inicia sesión nuevamente

### Error: "Connection Refused"
- Asegúrate de que el Worker esté ejecutándose en `http://127.0.0.1:8787`
- Verifica que ambos servicios (frontend y worker) estén activos

### El canvas no se mueve
- Usa la herramienta "Seleccionar" para mover el canvas
- Haz clic y arrastra en un área vacía

### Las tarjetas se mueven juntas
- Este problema ya está solucionado
- Si persiste, actualiza la página

## 📖 Documentación Adicional

- **README.md**: Información general del proyecto
- **DEPLOYMENT.md**: Guía detallada de despliegue
- **docs/**: Documentación de módulos y arquitectura

## 🤝 Soporte

Si encuentras algún problema:
1. Revisa la consola del navegador (F12)
2. Verifica los logs del Worker
3. Consulta la documentación de Cloudflare Workers

## 🎉 ¡Disfruta creando!

Carlini Whiteboard está diseñado para ser intuitivo y poderoso. Explora todas las herramientas y descubre nuevas formas de organizar tus ideas.

**Powered by Cloudflare Workers + D1**

