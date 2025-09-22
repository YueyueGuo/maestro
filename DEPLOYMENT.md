# Maestro Deployment Guide

## Option 1: Deploy to Vercel (Recommended)

### Prerequisites
- Vercel account (free at https://vercel.com)
- Git repository with your code

### Steps

1. **Push code to Git repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial Maestro setup - Day 1 MVP"
   git branch -M main
   git remote add origin <your-git-repo-url>
   git push -u origin main
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your Git repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

3. **Deploy via Vercel CLI** (Alternative):
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

### Environment Variables (For Future API Integration)

When ready to add real APIs, configure these in Vercel Dashboard:

```env
# Supabase (when ready)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI (when ready)
OPENAI_API_KEY=your_openai_api_key

# Google Vision (when ready)
GOOGLE_VISION_KEY_PATH=/path/to/service-account.json

# Feature Flags
NEXT_PUBLIC_ENABLE_CAMERA=true
NEXT_PUBLIC_ENABLE_AI=false
NEXT_PUBLIC_ENABLE_OCR=false
NEXT_PUBLIC_ENABLE_BARCODE=false
```

## Option 2: Deploy to Netlify

1. **Build the app**:
   ```bash
   npm run build
   npm run export  # If using static export
   ```

2. **Deploy to Netlify**:
   - Drag and drop `out` folder to Netlify
   - Or connect Git repository

## Option 3: Self-Hosted

### Using PM2 (Node.js Production)

1. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

2. **Build and start**:
   ```bash
   npm run build
   pm2 start npm --name "maestro" -- start
   ```

### Using Docker

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run**:
   ```bash
   docker build -t maestro .
   docker run -p 3000:3000 maestro
   ```

## PWA Deployment Considerations

### HTTPS Requirement
- PWA features require HTTPS
- Vercel provides HTTPS by default
- For self-hosted: use Let's Encrypt or Cloudflare

### Service Worker
- Service worker only works in production builds
- Test PWA installation on mobile devices
- Verify offline functionality

### Icons and Manifest
Before deploying for real users, add proper icons:

```bash
# Create these files in /public:
icon-192.png    # 192x192 app icon
icon-512.png    # 512x512 app icon
apple-touch-icon.png  # 180x180 for iOS
favicon.ico     # Browser favicon
```

## Performance Optimization

### Before Deployment
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Test performance
npm run build
npm start
# Use Lighthouse to audit
```

### Vercel Optimizations
- Enable Edge Functions for API routes
- Use Vercel Analytics
- Configure caching headers

## Monitoring and Analytics

### Basic Setup
1. **Vercel Analytics** (Built-in):
   ```bash
   npm install @vercel/analytics
   ```

2. **Google Analytics** (Optional):
   ```bash
   npm install @gtag/nextjs
   ```

## Troubleshooting Deployment

### Common Issues

1. **Build Fails**:
   - Check TypeScript errors: `npm run build`
   - Verify all dependencies are installed
   - Check Node.js version compatibility

2. **PWA Not Installing**:
   - Ensure HTTPS deployment
   - Check manifest.json syntax
   - Verify service worker registration

3. **Images Not Loading**:
   - Add actual icon files to `/public`
   - Update `next.config.ts` image domains

4. **Environment Variables**:
   - Prefix client-side vars with `NEXT_PUBLIC_`
   - Restart deployment after adding variables

### Testing Production Build Locally

```bash
# Build and test production version
npm run build
npm start

# Test PWA features
# Serve over HTTPS using ngrok or similar
npx serve out -s -p 3000
```

## Post-Deployment Checklist

- [ ] App loads without errors
- [ ] All pages are accessible
- [ ] Mobile navigation works
- [ ] PWA installs correctly on mobile
- [ ] Service worker registers
- [ ] Performance scores are good (Lighthouse)
- [ ] All test data displays correctly
- [ ] Build optimizations are working

## Next Phase Deployment

When implementing real features (Day 2+):

1. **Set up Supabase project**
2. **Configure API keys**
3. **Enable camera permissions**
4. **Test on real mobile devices**
5. **Add proper error monitoring**
6. **Set up automated deployments**

## Security Notes

- Never commit API keys to Git
- Use environment variables for all secrets
- Enable CORS protection for production APIs
- Implement rate limiting for API routes
- Use HTTPS everywhere

## Cost Monitoring

Current MVP has no runtime costs:
- Static site hosting (free on Vercel)
- No database calls
- No AI API calls

Future costs (when APIs are enabled):
- OpenAI Vision: ~$0.015 per food analysis
- Google Vision OCR: ~$0.0015 per nutrition label
- Supabase: Free tier covers development

## Domain Setup (Optional)

1. **Custom Domain on Vercel**:
   - Add domain in Vercel dashboard
   - Update DNS records
   - SSL automatically configured

2. **Domain Configuration**:
   ```bash
   # Update next.config.ts
   const nextConfig = {
     images: {
       domains: ['yourdomain.com']
     }
   }
   ```

This completes the foundation setup. The app is now ready for deployment and further development!