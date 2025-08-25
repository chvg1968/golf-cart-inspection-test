#!/bin/bash

echo "🚀 Deploying Supabase Functions..."

# Check if logged in
if ! supabase projects list > /dev/null 2>&1; then
    echo "❌ Not logged in to Supabase. Please run: supabase login"
    exit 1
fi

# Deploy functions
echo "📤 Deploying send-email function..."
supabase functions deploy send-email

echo "📤 Deploying serve-pdf function..."
supabase functions deploy serve-pdf

echo "📤 Deploying autenticar-usuario function..."
supabase functions deploy autenticar-usuario

echo "✅ All functions deployed successfully!"

# Show function URLs
echo ""
echo "🔗 Function URLs:"
supabase functions list