# Guía de Despliegue en Vercel

## 📋 Pre-requisitos

1. **Cuenta en Vercel**: Crear cuenta en [vercel.com](https://vercel.com)
2. **Base de datos PostgreSQL**: Tener una base de datos PostgreSQL (Neon, Supabase, etc.)
3. **Variables de entorno**: Preparar las siguientes variables

## 🔐 Variables de Entorno Requeridas

En Vercel, configurar las siguientes variables de entorno:

```bash
# Database Connection (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# NextAuth Configuration
NEXTAUTH_SECRET=tu-secret-key-aqui
NEXTAUTH_URL=https://tu-dominio.vercel.app
```

### Generar NEXTAUTH_SECRET

Ejecutar en terminal:
```bash
openssl rand -base64 32
```

O en PowerShell:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

## 🚀 Despliegue en Vercel

### Método 1: Desde la Interfaz Web

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Importar el repositorio de GitHub
3. Configurar las variables de entorno
4. Click en "Deploy"

### Método 2: Usando Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login en Vercel
vercel login

# Desplegar (desde la raíz del proyecto)
vercel

# Para producción
vercel --prod
```

## 🔧 Configuración Post-Despliegue

1. **Actualizar NEXTAUTH_URL**: Una vez desplegado, actualizar la variable `NEXTAUTH_URL` con la URL real de Vercel

2. **Verificar conexión a BD**: Asegurarse de que la base de datos permite conexiones desde Vercel

3. **Migrar Prisma** (si es necesario):
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 📝 Credenciales de Administrador

Usuario: `c205798`  
Contraseña: `Correos.007`

## 🎨 Características del Proyecto

- ✅ Next.js 15.5.6 con Pages Router
- ✅ PostgreSQL con Prisma ORM
- ✅ NextAuth para autenticación
- ✅ React Leaflet para mapas
- ✅ Tailwind CSS con tema Correos (azul/amarillo)
- ✅ 640 registros de calles en 23 secciones

## 🔍 URLs Importantes

- **Home**: `/`
- **Búsqueda**: `/busqueda`
- **Admin Dashboard**: `/admin/dashboard`
- **Gestión de Calles**: `/admin/calles`
- **Estadísticas**: `/admin/estadisticas`
- **Secciones**: `/admin/secciones`

## ⚠️ Notas Importantes

1. La base de datos debe estar accesible públicamente o permitir conexiones desde Vercel
2. Asegurarse de que el string de conexión incluye `?sslmode=require` para PostgreSQL
3. El build incluye automáticamente `prisma generate`
4. Los archivos `.env` no se suben a Git (están en `.gitignore`)

## 🐛 Troubleshooting

### Error: "Prisma Client not generated"
```bash
npx prisma generate
```

### Error: "Cannot connect to database"
- Verificar que `DATABASE_URL` está correctamente configurada
- Verificar que la BD permite conexiones externas
- Verificar que el string incluye `?sslmode=require`

### Error: "NextAuth configuration error"
- Verificar que `NEXTAUTH_SECRET` está configurada
- Verificar que `NEXTAUTH_URL` coincide con la URL de despliegue
