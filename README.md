# 🐄 ConteoGanadero – Progressive Web App

**ConteoGanadero** es una aplicación web progresiva (PWA) diseñada para la gestión eficiente del ganado. Permite a cada usuario llevar un registro de sus animales de forma individual, desde cualquier dispositivo, incluso sin conexión. Está pensada con una arquitectura modular, centrada en una experiencia fluida, rápida y adaptable a móviles.

---

## 🚀 Tecnologías Utilizadas

- **HTML5** y **CSS3** – Estructura y diseño responsivo
- **JavaScript (ES Modules)** – Lógica principal
- **Firebase Firestore** – Almacenamiento en la nube
- **Firebase Authentication** – Autenticación de usuarios
- **PWA Ready** – Soporte offline, instalación y caché inteligente
- **Service Worker** y **Manifest** – Funcionalidad offline e instalación
- **Modular Routing** – Navegación SPA con carga dinámica de vistas

---

## 🗂️ Estructura del Proyecto

```bash
public/
│
├── css/
│   └── style.css                  # Estilos base y móviles
│
├── icons/
│   ├── icon-192.png
│   └── icon-512.png               # Iconos para instalación PWA
│
├── js/
│   ├── app.js                     # Lógica principal y navegación SPA
│   ├── auth.js                    # Gestión de autenticación con Firebase
│   ├── db.js                      # Funciones para CRUD con Firestore
│   ├── firebase-config.js         # Configuración e inicialización de Firebase
│   ├── sw.js                      # Service Worker para caché offline
│   └── utils.js                   # Utilidades (validaciones, edad, etc.)
│
├── views/
│   ├── agregar.html               # Vista para agregar animales
│   ├── eliminar.html              # Vista para eliminar registros
│   ├── modificar.html             # Vista para editar animales
│   ├── main.html                  # Vista principal con acceso y menú
│   └── mostrar-todos.html        # Vista para mostrar todos los animales
│
├── index.html                     # Página principal y contenedor SPA
├── manifest.json                  # Configuración para instalación PWA
└── firebase.json                  # Configuración para hosting Firebase
```

## 🧠 Funcionalidades

### ➕ Registro de animales

- Formulario dinámico con validaciones en tiempo real

- Cálculo automático de edad en meses

### ✏️ Edición y Eliminación

- Modificación de datos con interfaz amigable

- Confirmaciones antes de eliminar

### 🔐 Autenticación por Usuario

- Firebase Authentication para separar los datos por usuario

### 💾 Persistencia en la Nube (Firestore)

- Datos almacenados de forma segura en Firestore

- Sincronización automática y en tiempo real

## 🎨 Experiencia de Usuario (UX)

### 📱 Experiencia Móvil Mejorada

- Diseño mobile-first

- Animaciones al hacer hover y mantener presionado

- Interacciones optimizadas para pantallas táctiles

## ⚙️ Funcionalidad Offline (PWA)

- Carga desde caché cuando no hay conexión

- Posibilidad de instalar la app en dispositivos móviles o escritorio

## 🧩 Pendientes y mejoras

🔜 A implementar:

- Estadísticas generales (total, edad promedio, distribución)

- Exportación/importación de datos

- Mejora visual con librerías UI (opcional)

## 🚀 Cómo usar

## 🧠 Créditos

👥 DESARROLLADO POR: ALLISON RUIZ Y SANTIAGO DIAZ

---
