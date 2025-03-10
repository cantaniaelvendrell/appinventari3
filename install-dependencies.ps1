Write-Host "Instalando dependencias del proyecto..." -ForegroundColor Green

# Instalar dependencias principales
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr
npm install @headlessui/react @heroicons/react react-hook-form
npm install @tanstack/react-table xlsx jspdf
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-toast
npm install lucide-react class-variance-authority clsx tailwind-merge

# Instalar dependencias de desarrollo
npm install -D @types/node @types/react @types/react-dom typescript
npm install -D tailwindcss postcss autoprefixer
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser

Write-Host "Instalación completada!" -ForegroundColor Green 