#!/bin/bash

echo "🚀 Starting full deployment..."

# Deploy Supabase functions first
echo "1️⃣  Deploying Supabase functions..."
./deploy-supabase.sh

if [ $? -ne 0 ]; then
    echo "❌ Supabase deployment failed!"
    exit 1
fi

# Build and prepare frontend
echo ""
echo "2️⃣  Building frontend..."
./deploy-frontend.sh

echo ""
echo "🎉 Deployment process completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Upload 'dist' folder to your web hosting service"
echo "   2. Set environment variables on your hosting platform"
echo "   3. Test the application on production"