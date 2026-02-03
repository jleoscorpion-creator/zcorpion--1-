# Integración de Supabase - Guía de Configuración

## Pasos para configurar Supabase

### 1. Crear un proyecto en Supabase

1. Dirígete a [supabase.com](https://supabase.com)
2. Inicia sesión con tu cuenta (o crea una nueva)
3. Crea un nuevo proyecto llamado `jleo.scorpion@gmail.com`
4. Espera a que se inicialice el proyecto (puede tomar unos minutos)

### 2. Obtener las credenciales

1. Ve a **Project Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** (VITE_SUPABASE_URL)
   - **Anon Public** key (VITE_SUPABASE_ANON_KEY)

### 3. Actualizar el archivo .env.local

En la raíz del proyecto, abre o crea el archivo `.env.local` y actualiza los valores:

```
VITE_SUPABASE_URL=tu-url-aqui
VITE_SUPABASE_ANON_KEY=tu-clave-aqui
```

### 4. Crear las tablas en Supabase

1. En Supabase, ve a **SQL Editor** (en el sidebar izquierdo)
2. Haz clic en **New Query**
3. Copia TODO el contenido del archivo `SUPABASE_SETUP.sql` de este proyecto
4. Pégalo en el SQL Editor
5. Ejecuta la consulta (botón "Run" o Ctrl+Enter)

### 5. Configurar autenticación

1. Ve a **Authentication** → **Providers**
2. Asegúrate de que "Email" está habilitado
3. Ve a **Email Templates** y personaliza si lo deseas
4. En **Settings**, puedes configurar:
   - Redireccionamiento después de confirmar email
   - Tiempo de expiración de tokens

### 6. Instalar dependencias

Ejecuta en terminal:

```bash
npm install
```

### 7. Ejecutar la aplicación

```bash
npm run dev
```

## Estructura de datos

### Tabla: profiles
- `id` (UUID): ID del usuario de Supabase Auth
- `email` (VARCHAR): Email del usuario
- `display_name` (VARCHAR): Nombre mostrado
- `monthly_income` (DECIMAL): Ingreso mensual
- `frequency` (VARCHAR): WEEKLY, BIWEEKLY, MONTHLY
- `currency` (VARCHAR): Código de moneda (USD, EUR, etc)
- `streak` (INTEGER): Días consecutivos de uso
- `reminders` (JSONB): Configuración de recordatorios

### Tabla: movements
- `id` (UUID): ID único del movimiento
- `user_id` (UUID): ID del usuario (referencia a profiles)
- `amount` (DECIMAL): Monto del movimiento
- `category` (VARCHAR): Categoría del gasto
- `description` (TEXT): Descripción
- `date` (DATE): Fecha del movimiento
- `frequency` (VARCHAR): Frecuencia si es un gasto fijo

### Tabla: savings_goals
- `id` (UUID): ID único de la meta
- `user_id` (UUID): ID del usuario
- `name` (VARCHAR): Nombre de la meta
- `target_amount` (DECIMAL): Monto objetivo
- `current_amount` (DECIMAL): Monto acumulado
- `deadline` (DATE): Fecha límite

## Flujo de autenticación

1. El usuario se registra con email y contraseña
2. Se crea automáticamente un perfil en la tabla `profiles`
3. Supabase envía un email de confirmación
4. Una vez confirmado, el usuario puede iniciar sesión
5. Los datos se guardan y sincronizan con Supabase

## Características implementadas

✅ Registro de nuevos usuarios
✅ Login/Logout con Supabase Auth
✅ Persistencia de datos en base de datos
✅ Sincronización automática de movimientos
✅ Row Level Security (RLS) para privacidad
✅ Carga automática de datos al iniciar sesión

## Archivos creados/modificados

- `.env.local` - Variables de entorno de Supabase
- `services/supabaseClient.ts` - Cliente de Supabase
- `services/authService.ts` - Servicio de autenticación
- `services/movementService.ts` - Servicio de movimientos
- `components/LoginRegister.tsx` - Componente de login/registro
- `components/LoginRegister.module.css` - Estilos del login
- `App.tsx` - Integración de Supabase en la app principal
- `SUPABASE_SETUP.sql` - Script SQL para crear tablas

## Troubleshooting

### Error: "Missing Supabase credentials"
- Verifica que los valores en `.env.local` sean correctos
- Asegúrate de que estén sin espacios en blanco
- Recarga la página después de actualizar .env.local

### Error de autenticación
- Verifica que el email esté confirmado en Supabase
- Comprueba que el usuario no esté duplicado
- Revisa los logs en Supabase Dashboard → Authentication → Logs

### Los movimientos no se guardan
- Verifica que el usuario esté autenticado (currentUser existe)
- Comprueba que las tablas se crearon correctamente
- Revisa la consola del navegador para errores

## Próximos pasos opcionales

- Integrar OAuth (Google, GitHub)
- Implementar recuperación de contraseña
- Agregar validaciones adicionales
- Crear endpoints para reportes
- Configurar backups automáticos
