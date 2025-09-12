# RykoFrontend

Aplicación móvil de gestión nutricional desarrollada con React Native y Expo.

## 📱 Descripción

RykoFrontend es una aplicación móvil que permite a los usuarios gestionar su alimentación, crear platos personalizados, establecer objetivos nutricionales y recibir recomendaciones personalizadas. La aplicación incluye funcionalidades de autenticación, perfiles de usuario y seguimiento de macronutrientes.

## 2. Marco Teórico y Tecnológico

### 2.1 Tecnologías Implementadas

La selección tecnológica se basó en criterios de escalabilidad, mantenibilidad y rendimiento:

| Tecnología             | Versión  | Justificación Técnica                                                             |
| ---------------------- | -------- | --------------------------------------------------------------------------------- |
| **React Native**       | 0.79.5   | Framework multiplataforma que permite desarrollo nativo con JavaScript            |
| **Expo**               | ~53.0.22 | Plataforma que simplifica el desarrollo y despliegue de aplicaciones React Native |
| **TypeScript**         | ~5.8.3   | Superset de JavaScript que proporciona tipado estático y mejor mantenibilidad     |
| **Expo Router**        | ~5.1.5   | Sistema de navegación basado en archivos que mejora la organización del código    |
| **Zustand**            | ^5.0.7   | Librería de gestión de estado ligera y eficiente                                  |
| **NativeWind**         | ^4.1.23  | Implementación de Tailwind CSS para React Native                                  |
| **Axios**              | ^1.9.0   | Cliente HTTP para comunicación con APIs REST                                      |
| **React Native Paper** | ^5.14.5  | Librería de componentes UI que sigue Material Design                              |

### 2.2 Arquitectura del Sistema

El proyecto implementa una arquitectura modular basada en los siguientes principios:

- **Separación de responsabilidades**: Organización clara entre lógica de negocio, presentación y datos
- **Reutilización de componentes**: Desarrollo de componentes modulares y reutilizables
- **Gestión de estado centralizada**: Implementación de Zustand para manejo eficiente del estado global
- **Tipado estático**: Uso de TypeScript para reducir errores en tiempo de ejecución

## 3. Metodología de Desarrollo

### 3.1 Enfoque de Desarrollo

Se aplicó una metodología de desarrollo incremental con las siguientes fases:

1. **Análisis y Diseño**: Definición de requisitos y arquitectura del sistema
2. **Implementación Modular**: Desarrollo por componentes y funcionalidades
3. **Integración Continua**: Pruebas y validación de funcionalidades
4. **Optimización**: Refinamiento de rendimiento y experiencia de usuario

### 3.2 Funcionalidades Implementadas

#### Módulo de Autenticación

- Sistema de registro y login con validación de datos
- Integración con Google OAuth 2.0
- Gestión segura de tokens de autenticación
- Recuperación de contraseñas

#### Módulo de Gestión de Perfiles

- Configuración de datos personales (edad, peso, altura)
- Definición de objetivos nutricionales personalizados
- Gestión de preferencias alimentarias
- Configuración de intolerancias y restricciones dietéticas

#### Módulo de Gestión Alimentaria

- Creación y edición de platos personalizados
- Cálculo automático de valores nutricionales
- Gestión de ingredientes y porciones
- Historial de consumo alimentario

#### Sistema de Recomendaciones

- Algoritmos de sugerencias personalizadas
- Consejos nutricionales adaptativos
- Seguimiento de progreso hacia objetivos

## 4. Implementación y Configuración

### 4.1 Requisitos del Sistema

Para la correcta ejecución del proyecto se requieren las siguientes especificaciones técnicas:

| Componente | Especificación Mínima | Recomendado |
|------------|----------------------|-------------|
| **Node.js** | v18.0.0 | v20.0.0 o superior |
| **Memoria RAM** | 8GB | 16GB |
| **Espacio en disco** | 2GB libres | 5GB libres |
| **Sistema Operativo** | Windows 10, macOS 10.15, Ubuntu 18.04 | Versiones más recientes |

### 4.2 Procedimiento de Instalación

#### Paso 1: Preparación del Entorno
```bash
# Verificar versión de Node.js
node --version

# Instalar Expo CLI globalmente
npm install -g @expo/cli
```

#### Paso 2: Configuración del Proyecto
```bash
# Clonar el repositorio del proyecto
git clone <url-del-repositorio>
cd RykoFrontend

# Instalación de dependencias
npm install
```

#### Paso 3: Configuración de Variables de Entorno
```bash
# Crear archivo de configuración
cp .env.example .env

# Configurar variables necesarias
# API_BASE_URL=<url-de-la-api>
# GOOGLE_CLIENT_ID=<google-oauth-client-id>
```

### 4.3 Ejecución del Sistema

#### Entorno de Desarrollo
```bash
# Inicializar servidor de desarrollo
npm start

# Ejecución específica por plataforma
npm run android    # Para dispositivos Android
npm run ios        # Para dispositivos iOS
npm run web        # Para navegador web
```

#### Construcción para Producción
```bash
# Generar build optimizado
expo build:android
expo build:ios
expo build:web
```
