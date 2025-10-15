# 🎨 Carlini Whiteboard

Una aplicación web de pizarra digital personal similar a Miro, construida con React, Cloudflare Workers y D1. Diseñada para uso individual con almacenamiento multi-tenant.

## ✨ Características Principales

### 🎯 Funcionalidades del Canvas
- **Dibujo Libre**: Herramienta de lápiz con diferentes grosores y colores
- **Formas Geométricas**: Rectángulos, círculos, líneas y flechas
- **Texto Editable**: Agregar y editar texto directamente en el canvas
- **Notas Adhesivas**: Crear notas de colores para organizar ideas
- **Selección y Manipulación**: Mover, escalar, rotar y agrupar elementos
- **Zoom y Pan**: Navegación fluida por el lienzo infinito

### 💾 Persistencia y Sincronización
- **Auto-guardado**: Guardado automático cada 2 segundos
- **Multi-tenant**: Cada usuario tiene sus propios tableros aislados
- **Historial**: Sistema de deshacer/rehacer completo
- **Exportación**: Guardar y cargar tableros en formato JSON

### 🎨 Interfaz de Usuario
- **Diseño Moderno**: Interfaz limpia inspirada en Miro
- **Responsive**: Funciona perfectamente en desktop, tablet y móvil
- **Touch Support**: Soporte completo para dispositivos táctiles
- **Accesibilidad**: Controles de teclado y navegación por teclado

## 🏗️ Arquitectura Técnica

### Frontend (React + Vite)
```
src/
├── components/
│   ├── Canvas/           # Componentes del lienzo
│   │   ├── WhiteboardCanvas.jsx
│   │   ├── elements/     # Elementos del canvas
│   │   ├── SelectionBox.jsx
│   │   └── ToolHandler.jsx
│   └── UI/              # Componentes de interfaz
│       ├── Header.jsx
│       ├── Toolbar.jsx
│       └── WhiteboardList.jsx
├── store/
│   └── useWhiteboardStore.js  # Estado global con Zustand
└── App.jsx
```

### Backend (Cloudflare Workers)
```
worker/
├── src/
│   └── index.js         # API REST endpoints
├── schema.sql           # Esquema de base de datos
├── wrangler.toml        # Configuración del Worker
└── package.json
```

### Base de Datos (Cloudflare D1)
```sql
-- Tabla de usuarios
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tableros
CREATE TABLE whiteboards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    data TEXT NOT NULL,  -- JSON con elementos del canvas
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **React-Konva** - Canvas interactivo
- **Zustand** - Manejo de estado
- **Tailwind CSS** - Framework de estilos
- **Lucide React** - Iconos

### Backend
- **Cloudflare Workers** - Runtime serverless
- **Cloudflare D1** - Base de datos SQL
- **Wrangler** - CLI para despliegue

### Herramientas de Desarrollo
- **ESLint** - Linter de código
- **Prettier** - Formateador de código
- **Git** - Control de versiones

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Cloudflare
- Wrangler CLI

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/carlini-whiteboard.git
cd carlini-whiteboard
```

### 2. Instalar Dependencias
```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del worker
cd worker
npm install
cd ..
```

### 3. Configurar Cloudflare

#### Crear Base de Datos D1
```bash
# Crear la base de datos
wrangler d1 create carlini-whiteboard-db

# Aplicar el esquema
wrangler d1 execute carlini-whiteboard-db --file=./worker/schema.sql
```

#### Configurar Wrangler
```bash
# Autenticar con Cloudflare
wrangler login

# Actualizar wrangler.toml con los IDs de tu base de datos
```

### 4. Desarrollo Local

#### Frontend
```bash
# Iniciar servidor de desarrollo
npm run dev
```

#### Worker (API)
```bash
# Iniciar worker en modo desarrollo
cd worker
npm run dev
```

### 5. Despliegue

#### Desplegar Worker
```bash
cd worker
npm run deploy
```

#### Desplegar Frontend
```bash
# Construir para producción
npm run build

# Desplegar a Cloudflare Pages
wrangler pages deploy dist
```

## 🎮 Uso de la Aplicación

### Herramientas Básicas
1. **Seleccionar**: Click en el icono de cursor para seleccionar elementos
2. **Dibujar**: Selecciona el lápiz y dibuja libremente
3. **Formas**: Usa las herramientas de formas para crear elementos geométricos
4. **Texto**: Agrega texto haciendo click en el icono de texto
5. **Notas**: Crea notas adhesivas de colores

### Controles Avanzados
- **Zoom**: Usa los botones + y - o la rueda del mouse
- **Pan**: Arrastra con el mouse o usa dos dedos en móvil
- **Deshacer/Rehacer**: Ctrl+Z / Ctrl+Y o botones en la barra
- **Guardar**: Auto-guardado cada 2 segundos
- **Cargar**: Abre tableros desde la lista lateral

### Atajos de Teclado
- `Ctrl+Z`: Deshacer
- `Ctrl+Y`: Rehacer
- `Ctrl+S`: Guardar manual
- `Escape`: Cancelar selección
- `Delete`: Eliminar elementos seleccionados

## 🔧 API Endpoints

### Whiteboards
- `GET /api/whiteboards` - Listar tableros del usuario
- `GET /api/whiteboards/:id` - Obtener tablero específico
- `POST /api/whiteboards` - Crear nuevo tablero
- `PUT /api/whiteboards/:id` - Actualizar tablero
- `DELETE /api/whiteboards/:id` - Eliminar tablero

### Usuarios
- `GET /api/users` - Información del usuario actual
- `POST /api/users` - Crear nuevo usuario (futuro)
- `PUT /api/users/:id` - Actualizar usuario (futuro)

## 🎨 Personalización

### Colores del Tema
Modifica las variables CSS en `src/index.css`:
```css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #6366f1;
  --background-color: #f9fafb;
  --canvas-color: #ffffff;
}
```

### Agregar Nuevas Herramientas
1. Agregar el botón en `src/components/UI/Toolbar.jsx`
2. Implementar la lógica en `src/components/Canvas/ToolHandler.jsx`
3. Crear el componente del elemento en `src/components/Canvas/elements/`

## 🚀 Próximas Características

### Versión 2.0
- [ ] **Autenticación Completa**: Login/registro con Lucia Auth
- [ ] **Colaboración en Tiempo Real**: WebSockets con Y.js
- [ ] **Plantillas**: Biblioteca de plantillas predefinidas
- [ ] **Exportación Avanzada**: PDF, PNG, SVG
- [ ] **Historial de Versiones**: Control de versiones de tableros

### Versión 2.1
- [ ] **Integración con Nube**: Cloudflare R2 para archivos
- [ ] **Comentarios**: Sistema de comentarios y anotaciones
- [ ] **Presentaciones**: Modo presentación con slides
- [ ] **Integraciones**: Conectar con herramientas externas

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución
- Sigue las convenciones de código existentes
- Agrega tests para nuevas funcionalidades
- Actualiza la documentación cuando sea necesario
- Usa commits descriptivos

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- **Miro** - Inspiración para el diseño y funcionalidades
- **React-Konva** - Canvas interactivo de alta calidad
- **Cloudflare** - Infraestructura serverless robusta
- **Tailwind CSS** - Framework de estilos excepcional
- **Lucide** - Iconos hermosos y consistentes

## 📞 Soporte

- **Documentación**: [Wiki del proyecto](https://github.com/tu-usuario/carlini-whiteboard/wiki)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/carlini-whiteboard/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/tu-usuario/carlini-whiteboard/discussions)

---

**Desarrollado con ❤️ para facilitar la creatividad y organización visual**