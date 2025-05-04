#!/bin/bash

# Script para ejecutar migraciones de Supabase
echo "Ejecutando migraciones de Supabase..."

# Asegurarse de que estamos en el directorio correcto
cd "$(dirname "$0")/.."

# Ejecutar la migración con Supabase CLI
echo "Aplicando migración de formularios persistentes..."
supabase db push

echo "Migraciones completadas con éxito."
