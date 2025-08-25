#!/bin/bash

echo "🏗️  Building frontend..."

# Build the project
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if you're using a specific hosting service
echo ""
echo "📤 Ready to deploy to your hosting service:"
echo "   - Vercel: vercel --prod"
echo "   - Netlify: netlify deploy --prod --dir=dist"
echo "   - Firebase: firebase deploy"
echo "   - Manual: Upload 'dist' folder to your web server"

echo ""
echo "🔗 Don't forget to set environment variables on your hosting platform:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "   - VITE_SENDER_EMAIL"