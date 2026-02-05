# zcorpion
Aplicación de finanzas personales con integración a Gemini.

## Ejecutar localmente

Prerequisitos: Node.js

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Variables de entorno locales (opcional para pruebas): crea un archivo `.env.local` con las claves necesarias. NO subas este archivo al repositorio.

3. Ejecutar en desarrollo:

   ```bash
   npm run dev
   ```

## Deploy en Netlify

- Asegúrate de que la carpeta `netlify/functions` esté comiteada (la función `gemini.ts` hace las llamadas al API desde el servidor).
- En Netlify Dashboard → Site settings → Build & deploy → Environment, añade la variable:

  - `GEMINI_API_KEY` = tu clave privada de Gemini

Netlify Functions leerán `process.env.GEMINI_API_KEY` y la clave no quedará expuesta al cliente.

## Notas sobre seguridad

- Mantén las claves reales en las variables de entorno del proveedor (Netlify) y no en el repositorio.
- Guarda solo `/.env.example` en el repo con nombres de variables, no valores reales.

## Comandos git para commitear y pushear cambios

```bash
git add .
git commit -m "Actualizar .gitignore y README; agregar Netlify Function para Gemini"
git push origin main
```

Si tienes errores al pushear revisa que la rama remota exista y que tengas permisos.
