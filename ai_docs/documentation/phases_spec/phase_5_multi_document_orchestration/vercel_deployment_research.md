# Vercel Free Plan Deployment Research
## Next.js 14 + Supabase + Gemini AI Stack

**Date:** 2025-11-05
**Target:** Vercel Hobby (Free) Plan
**Stack:** Next.js 14 App Router, Supabase, Gemini AI, TipTap, docx

---

## Executive Summary

### Critical Limitations
- **Function timeout:** 10 seconds (hard limit)
- **Request body size:** 4.5 MB max
- **Bandwidth:** 100 GB/month
- **Build time:** 45 minutes max
- **No warm instances:** Free plan = frequent cold starts
- **AI operations (30-90s):** CANNOT run on free plan without workarounds

### Required Workarounds
1. Use Edge Runtime with streaming for AI operations
2. Implement client-side file uploads to Supabase Storage
3. Configure Fluid Compute or upgrade to Pro plan
4. Optimize bundle size aggressively

---

## 1. Vercel Free Plan Limits

### Function Execution
| Limit | Hobby (Free) | Pro | Enterprise |
|-------|-------------|-----|------------|
| Serverless timeout | 10s | 60s | 900s |
| Edge timeout | 25s (unlimited with streaming) | 30s | 30s |
| Fluid Compute timeout | 60s | 14 min | 14 min |
| Function memory | 1024 MB | 3008 MB | 3008 MB |
| Functions per deployment | 12 | 12 | 100 |

**Key Insight:** 30-90s AI operations require Edge Runtime with streaming OR Fluid Compute.

### Bandwidth & Resources
- **Bandwidth:** 100 GB/month (rolling 30-day window)
- **Build time:** 45 minutes max per deployment
- **Source files:** 12,500 max
- **Build output files:** 16,000 max
- **Deployments:** Unlimited, but no pay-as-you-go if limits exceeded

### Environment Variables
- **Max per environment:** 1,000 variables
- **Total size:** 64 KB (names + values combined)
- **Edge Functions:** 5 KB per variable
- **All plans:** Same limits

**Best Practice:** Supabase + Gemini keys fit easily. No issues.

### Request Limits
- **Body size:** 4.5 MB max (cannot be increased)
- **No built-in rate limiting:** Must implement custom solution
- **Attack protection:** Free DDoS mitigation included

---

## 2. Handling Long-Running AI Operations

### Problem
- Gemini content generation: 30-90 seconds
- Free plan timeout: 10 seconds
- Result: `FUNCTION_TIMEOUT` error

### Solution 1: Edge Runtime + Streaming (RECOMMENDED)

**Why Edge Runtime?**
- 25s timeout (vs 10s serverless)
- Unlimited timeout when streaming
- No cold starts
- Lower latency
- Works on free plan

**Implementation:**

```typescript
// app/api/work-packages/[id]/generate-content/route.ts
export const runtime = 'edge'; // CRITICAL: Enable Edge Runtime

export async function POST(request: Request) {
  const { prompt, context } = await request.json();

  // Stream response from Gemini
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:streamGenerateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': process.env.GEMINI_API_KEY!,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  // Return streaming response
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

**Client-side streaming:**

```typescript
// Client component
const generateContent = async () => {
  const response = await fetch(`/api/work-packages/${id}/generate-content`, {
    method: 'POST',
    body: JSON.stringify({ prompt, context }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value);
    setContent(prev => prev + chunk); // Progressive update
  }
};
```

**Benefits:**
- Works on free plan
- Better UX (progressive display)
- No timeout issues
- Lower latency

**Limitations:**
- Limited Node.js APIs (no `fs`, limited crypto)
- 1-4 MB code size limit
- Some npm packages won't work

### Solution 2: Fluid Compute

**Configuration:**

```typescript
// app/api/work-packages/[id]/generate-content/route.ts
export const maxDuration = 60; // 60s on free plan
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Non-streaming AI call
  const result = await generateWithGemini(prompt);
  return Response.json(result);
}
```

**Pros:**
- Full Node.js API access
- Simpler implementation
- 60s timeout (vs 10s)

**Cons:**
- Still 60s limit (might not be enough for 90s operations)
- Slower than Edge Runtime
- Cold starts persist

### Solution 3: Webhook/Callback Pattern

**For operations > 60s:**

```typescript
// Immediate response with job ID
export async function POST(request: Request) {
  const jobId = await createJob();

  // Trigger background job (external service or Upstash Workflow)
  await triggerBackgroundJob(jobId);

  return Response.json({ jobId, status: 'processing' });
}

// Polling endpoint
export async function GET(request: Request) {
  const status = await getJobStatus(jobId);
  return Response.json(status);
}
```

**Use with:** Upstash Workflow, QStash, or external worker service.

---

## 3. File Handling Strategy

### Upload Size Limits
- **Vercel body limit:** 4.5 MB (HARD LIMIT)
- **Next.js 14:** 1 MB default (configuration doesn't work reliably)
- **Your needs:** RFT documents (potentially > 4.5 MB)

### CRITICAL: Direct Client-Side Upload to Supabase

**DO NOT proxy through Vercel:**

```typescript
// WRONG - Hits 4.5 MB limit
async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  await fetch('/api/upload', { // Goes through Vercel
    method: 'POST',
    body: formData,
  });
}
```

```typescript
// CORRECT - Direct to Supabase Storage
import { createClient } from '@supabase/supabase-js';

async function uploadFile(file: File) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Direct upload - bypasses Vercel
  const { data, error } = await supabase.storage
    .from('work-packages')
    .upload(`${workPackageId}/${file.name}`, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;
  return data.path;
}
```

**File Export (Word docs):**

```typescript
// Generate on server, return as stream
export const runtime = 'nodejs'; // Need docx library

export async function GET(request: Request) {
  const doc = new Document({...}); // Generate DOCX
  const buffer = await Packer.toBuffer(doc);

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="export.docx"`,
    },
  });
}
```

**IMPORTANT:** DOCX export must use Node.js runtime (Edge Runtime doesn't support `docx` package).

---

## 4. Build Optimization

### Bundle Size Concerns
- **Your dependencies:** TipTap, docx, Supabase client, Gemini SDK
- **Next.js 14:** Improved tree-shaking
- **Free plan:** No specific size limit, but affects cold starts

### Configuration: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for smaller deployments
  output: 'standalone',

  // Experimental optimizations
  experimental: {
    // Reduce cold starts (CRITICAL for free plan)
    bundlePagesExternals: true,

    // Optimize server components
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },

  // Bundle analysis in development
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      // Analyze bundle
      config.optimization.usedExports = true;
    }
    return config;
  },

  // Reduce build output
  compress: true,
  poweredByHeader: false,

  // Skip type checking in build (do it separately)
  typescript: {
    ignoreBuildErrors: false, // Set to true only if CI does type checking
  },
  eslint: {
    ignoreDuringBuilds: false, // Set to true only if CI does linting
  },
};

module.exports = nextConfig;
```

### Optimize Dependencies

**Analyze bundle:**

```bash
npm install -D @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

```bash
ANALYZE=true npm run build
```

**Common large dependencies:**
- `@tiptap/react`: ~500 KB (unavoidable)
- `docx`: ~1.5 MB (server-only, acceptable)
- `@supabase/supabase-js`: ~200 KB (tree-shakeable)

**Optimization:**
- Import only needed TipTap extensions
- Keep `docx` server-side only
- Use `serverComponentsExternalPackages` for Supabase

### Build Time Optimization

**Strategies:**
- Use `.env.local` for local dev (not committed)
- Skip type checking in Vercel (run in CI)
- Cache dependencies (automatic on Vercel)
- Reduce SSG pages if any

**Current setup:** App Router with dynamic routes = fast builds.

---

## 5. Cold Start Optimization

### Reality on Free Plan
- **No warm instances:** Frequent cold starts inevitable
- **Cold start duration:** 500ms - 2s (can be 7s+ with large bundles)
- **Frequency:** 30%+ of requests can be cold starts
- **No mitigation:** Paid plans get warm instances

### Optimization Strategies

**1. Reduce Bundle Size (see above)**

**2. Update Next.js:**

```bash
npm install next@latest react@latest react-dom@latest
```

Next.js 14.2+ has 80% faster cold starts.

**3. Use Edge Runtime for critical paths:**

```typescript
// Faster startup than Node.js runtime
export const runtime = 'edge';
```

**4. Caching:**

```typescript
export async function GET(request: Request) {
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
```

**5. Optimize Regions:**

```json
// vercel.json
{
  "regions": ["iad1"] // Choose closest to Supabase region
}
```

**Reality Check:** You WILL experience cold starts. Design UX accordingly (loading states, optimistic updates).

---

## 6. Environment Variables Best Practices

### Required Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Gemini AI
GEMINI_API_KEY=AIzaSyxxx...

# Optional: Database direct connection (for migrations)
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
```

### Vercel Configuration

**1. Using Vercel Dashboard:**
- Settings > Environment Variables
- Add variables for Production, Preview, Development
- Use Supabase integration for auto-configuration

**2. Using Vercel CLI:**

```bash
vercel env add GEMINI_API_KEY
```

**3. Local Development:**

```bash
# .env.local (NOT committed)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
GEMINI_API_KEY=xxx
```

### Security Best Practices

**DO:**
- Use `NEXT_PUBLIC_` prefix only for client-side vars
- Keep API keys server-side (no `NEXT_PUBLIC_` prefix)
- Use Supabase RLS for security
- Rotate keys regularly

**DON'T:**
- Commit `.env.local` or `.env.production`
- Use `NEXT_PUBLIC_` for sensitive keys
- Hardcode keys in code

### Supabase Integration (RECOMMENDED)

**Steps:**
1. Vercel Dashboard > Integrations > Browse Marketplace
2. Search "Supabase" > Add Integration
3. Select project and link Supabase project
4. Environment variables auto-configured

**Auto-configured variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `POSTGRES_URL` (for direct DB access)

---

## 7. Common Deployment Pitfalls

### 1. Function Timeout Errors

**Error:** `FUNCTION_TIMEOUT` or `504 Gateway Timeout`

**Cause:** Function exceeds 10s limit

**Fix:**
- Use Edge Runtime: `export const runtime = 'edge';`
- Enable streaming for AI operations
- Use Fluid Compute: `export const maxDuration = 60;`

### 2. Body Size Limit

**Error:** `413: FUNCTION_PAYLOAD_TOO_LARGE`

**Cause:** Request body > 4.5 MB

**Fix:**
- Upload files directly to Supabase Storage
- Never proxy large files through Vercel

### 3. Cold Start Performance

**Symptom:** Slow initial requests (2-7s)

**Cause:** Large bundle + no warm instances on free plan

**Fix:**
- Enable `output: 'standalone'` in `next.config.js`
- Use `bundlePagesExternals: true`
- Update to Next.js 14.2+
- Use Edge Runtime for critical paths

### 4. Module Not Found Errors

**Error:** `ModuleNotFoundError: Cannot find module 'xxx'`

**Cause:**
- Dev dependency not in `dependencies`
- Case sensitivity (Vercel is case-sensitive)
- Missing `node_modules` in deployment

**Fix:**
- Move runtime deps to `dependencies` (not `devDependencies`)
- Check import case matches file case exactly
- Don't commit `node_modules` to Git
- Run `npm install` before build

### 5. Environment Variables Not Working

**Symptom:** `undefined` for env vars in production

**Cause:**
- Not configured in Vercel dashboard
- Using `NEXT_PUBLIC_` incorrectly
- Not rebuilding after adding vars

**Fix:**
- Add vars in Vercel Dashboard > Settings > Environment Variables
- Redeploy after adding variables
- Use `NEXT_PUBLIC_` only for client-side access
- Check spelling and case

### 6. Edge Runtime Compatibility

**Error:** `Module not found` or runtime error with Edge Runtime

**Cause:** Package uses Node.js APIs unavailable in Edge Runtime

**Fix:**
```typescript
// For routes needing Node.js APIs (e.g., docx export)
export const runtime = 'nodejs';

// For routes needing speed and streaming (AI operations)
export const runtime = 'edge';
```

**Edge Runtime incompatible:**
- `docx` package
- `fs` module
- Some crypto operations
- Database connection pooling

**Edge Runtime compatible:**
- `fetch` API
- Supabase client
- Most HTTP operations
- Streaming responses

### 7. Build Failures

**Error:** Build exceeds 45 minutes or fails

**Cause:**
- Type errors
- Large dependencies
- Slow build scripts

**Fix:**
- Run `npm run build` locally first
- Fix TypeScript errors before deploying
- Optimize dependencies
- Skip type checking in Vercel (do it in CI)

---

## 8. Recommended Vercel Configuration

### `vercel.json`

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["iad1"],
  "functions": {
    "app/api/work-packages/*/generate-content/route.ts": {
      "maxDuration": 60,
      "memory": 1024
    },
    "app/api/work-packages/*/export/route.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

**Note:**
- `maxDuration` requires Fluid Compute enabled
- `regions` should match Supabase region (check Supabase dashboard)
- Free plan: `maxDuration` max 60s

### `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  output: 'standalone',
  compress: true,
  poweredByHeader: false,

  // Experimental optimizations for free plan
  experimental: {
    bundlePagesExternals: true,
    serverComponentsExternalPackages: ['@supabase/supabase-js', 'docx'],
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // Redirects
  async redirects() {
    return [];
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

module.exports = nextConfig;
```

### Package Versions

```json
{
  "dependencies": {
    "next": "^14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.45.4",
    "@tiptap/react": "^2.8.0",
    "@tiptap/starter-kit": "^2.8.0",
    "docx": "^8.5.0"
  }
}
```

**CRITICAL:** Use Next.js 14.2+ for cold start improvements.

---

## 9. Deployment Checklist

### Pre-Deployment

- [ ] Update Next.js to 14.2+
- [ ] Run `npm run build` locally successfully
- [ ] Test all API routes with realistic payloads
- [ ] Verify file upload flow (direct to Supabase)
- [ ] Test AI operations with streaming
- [ ] Check bundle size with analyzer
- [ ] Verify environment variables in `.env.local`

### Vercel Configuration

- [ ] Install Supabase integration OR manually add env vars
- [ ] Add `GEMINI_API_KEY` environment variable
- [ ] Configure `next.config.js` with optimizations
- [ ] Add `vercel.json` with function configs (if needed)
- [ ] Set correct region (match Supabase region)
- [ ] Verify build command: `npm run build`
- [ ] Verify output directory: `.next`

### Code Configuration

- [ ] AI routes use Edge Runtime: `export const runtime = 'edge';`
- [ ] Streaming implemented for long AI operations
- [ ] File uploads go directly to Supabase Storage
- [ ] DOCX export uses Node.js runtime
- [ ] Loading states for all async operations
- [ ] Error boundaries for production errors
- [ ] Proper TypeScript types (no `any`)

### Post-Deployment

- [ ] Test production URL
- [ ] Verify AI content generation works (no timeouts)
- [ ] Test file upload (bypass Vercel body limit)
- [ ] Test file export/download
- [ ] Check Vercel dashboard for errors
- [ ] Monitor function duration (should be < 60s)
- [ ] Test from cold start (wait 5 min, then request)
- [ ] Verify Supabase RLS policies work
- [ ] Check bandwidth usage (stay under 100 GB)

### Monitoring

- [ ] Enable Vercel Analytics (free)
- [ ] Monitor function execution time
- [ ] Track bandwidth usage (rolling 30 days)
- [ ] Watch for timeout errors
- [ ] Check cold start frequency
- [ ] Monitor Supabase usage

---

## 10. Workarounds Summary

| Problem | Free Plan Issue | Workaround |
|---------|----------------|------------|
| 30-90s AI operations | 10s timeout | Edge Runtime + streaming |
| File uploads > 4.5 MB | 4.5 MB body limit | Direct client-side upload to Supabase Storage |
| Cold starts | No warm instances | Optimize bundle, use Edge Runtime, update Next.js |
| Build timeouts | None (45 min is generous) | N/A - shouldn't be an issue |
| Rate limiting | Not built-in | Implement with @upstash/ratelimit |
| DOCX export | Needs Node.js APIs | Use `runtime: 'nodejs'` for export routes |
| Large bundles | Slow cold starts | Use `output: 'standalone'`, tree-shake deps |

---

## 11. When to Upgrade to Pro Plan

### Free Plan Works If:
- AI operations use streaming (< 60s with Fluid Compute)
- File uploads go directly to Supabase
- Bandwidth < 100 GB/month
- Cold starts acceptable UX-wise
- Team size = 1 (personal project)

### Upgrade to Pro ($20/mo) If:
- AI operations > 60s (get 60s without streaming)
- Need warm instances (better cold start experience)
- Bandwidth > 100 GB/month
- Need analytics and monitoring
- Commercial project (Hobby plan = non-commercial only)
- Need password protection
- Need preview environments with env vars

### Pro Plan Benefits:
- **60s timeout** (vs 10s)
- **5 min with Fluid Compute** (vs 60s)
- **1 TB bandwidth** (vs 100 GB)
- **Warm instances** (fewer cold starts)
- **Analytics included**
- **Preview deployments** with env vars
- **Commercial use allowed**
- **Password protection**

---

## 12. Stack-Specific Recommendations

### Next.js 14 App Router
- Use Server Components by default
- Client Components only when needed (TipTap editor)
- Edge Runtime for AI streaming routes
- Node.js runtime for DOCX export routes

### Supabase
- Use Integration for automatic env vars
- Direct client-side uploads for files
- Enable RLS policies (don't rely on Vercel security)
- Use connection pooling (Supavisor) - auto-configured
- Match Vercel region to Supabase region if possible

### Gemini AI
- Use streaming API for content generation
- Implement proper error handling
- Show progressive output for better UX
- Set reasonable timeout (50s max to stay under 60s limit)

### TipTap
- Import only needed extensions
- Use client-side rendering
- Store content as JSON in Supabase
- Consider lazy loading extensions

### docx Package
- Only use in Node.js runtime routes
- Generate on-demand (don't pre-generate)
- Stream response directly
- Keep templates small

---

## 13. Code Examples

### AI Content Generation (Edge + Streaming)

```typescript
// app/api/work-packages/[id]/generate-content/route.ts
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { prompt, context } = await request.json();

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:streamGenerateContent?key=' +
      process.env.GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${context}\n\nGenerate content for: ${prompt}` }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Gemini API error');
    }

    // Stream response back to client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
```

### Client-Side File Upload

```typescript
// components/file-upload.tsx
'use client';

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function FileUpload({ workPackageId }: { workPackageId: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // No 4.5 MB limit - bypasses Vercel entirely
    setUploading(true);
    setError(null);

    try {
      const filePath = `${workPackageId}/${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from('work-packages')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Save file reference to database
      await fetch(`/api/work-packages/${workPackageId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: data.path,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type,
        }),
      });

      console.log('Upload successful:', data.path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleUpload}
        disabled={uploading}
        accept=".pdf,.doc,.docx"
      />
      {uploading && <p>Uploading...</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
```

### DOCX Export (Node.js Runtime)

```typescript
// app/api/work-packages/[id]/export/route.ts
import { Document, Packer, Paragraph, TextRun } from 'docx';

export const runtime = 'nodejs'; // REQUIRED for docx package
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch work package data
    const data = await fetchWorkPackageData(params.id);

    // Generate DOCX
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: data.title,
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: data.content,
                  size: 24,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${data.title}.docx"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    return Response.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

async function fetchWorkPackageData(id: string) {
  // Fetch from Supabase
  return {
    title: 'Work Package',
    content: 'Content here...',
  };
}
```

### Client-Side Streaming Consumer

```typescript
// components/content-generator.tsx
'use client';

import { useState } from 'react';

export function ContentGenerator({ workPackageId }: { workPackageId: string }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setContent('');

    try {
      const response = await fetch(
        `/api/work-packages/${workPackageId}/generate-content`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: 'Executive summary',
            context: 'RFT analysis results...',
          }),
        }
      );

      if (!response.ok) throw new Error('Generation failed');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);

        // Parse Gemini streaming format
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const json = JSON.parse(line.slice(6));
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
            setContent(prev => prev + text);
          }
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={generate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Content'}
      </button>
      <div className="content">{content}</div>
    </div>
  );
}
```

---

## 14. Testing Before Deployment

### Local Testing

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Test production build
npm run build
npm run start

# Test specific scenarios
# 1. Generate AI content (should take 30-90s)
# 2. Upload large file (> 4.5 MB) directly to Supabase
# 3. Export DOCX
# 4. Test cold start behavior (wait 5 min between requests)
```

### Vercel Preview Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Test preview URL thoroughly before production
```

### Load Testing (Optional)

```bash
# Install k6
brew install k6

# Simple load test
k6 run - <<EOF
import http from 'k6/http';
import { sleep } from 'k6';

export default function() {
  http.get('https://your-app.vercel.app');
  sleep(1);
}
EOF
```

---

## 15. Monitoring & Debugging

### Vercel Dashboard
- **Deployments:** Check build logs
- **Functions:** Monitor execution time
- **Analytics:** Track performance (Pro plan)
- **Logs:** Real-time function logs

### Common Debug Commands

```bash
# View logs
vercel logs

# View specific deployment logs
vercel logs [deployment-url]

# Check function duration
# (Vercel Dashboard > Functions tab)
```

### Supabase Monitoring
- **Database:** Check query performance
- **Storage:** Monitor file uploads
- **Auth:** Track user sessions
- **Logs:** View API logs

### Error Tracking

```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Application error:', error);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## 16. Final Recommendations

### MUST DO
1. **Use Edge Runtime + streaming for AI operations** - Critical for free plan
2. **Direct file uploads to Supabase** - Bypass 4.5 MB limit
3. **Update to Next.js 14.2+** - 80% faster cold starts
4. **Enable `output: 'standalone'`** - Smaller deployments
5. **Test locally first** - Catch errors before deployment

### SHOULD DO
1. Install Supabase integration - Auto-configures env vars
2. Optimize bundle size - Faster cold starts
3. Add error boundaries - Better production experience
4. Implement loading states - Handle cold starts gracefully
5. Monitor bandwidth usage - Stay under 100 GB

### CONSIDER
1. Upgrade to Pro plan if commercial - Better UX, warm instances
2. Use Vercel Analytics - Track performance
3. Implement rate limiting - Protect against abuse
4. Add Sentry - Error tracking
5. Use Upstash Workflow - For operations > 60s

### DON'T
1. Don't proxy file uploads through Vercel - Hits 4.5 MB limit
2. Don't use Node.js runtime for AI streaming - Use Edge Runtime
3. Don't commit `.env` files - Security risk
4. Don't ignore cold starts - Design UX accordingly
5. Don't assume 10s is enough - It's not for AI operations

---

## 17. Resources

### Official Documentation
- [Vercel Functions Documentation](https://vercel.com/docs/functions)
- [Vercel Limits](https://vercel.com/docs/limits)
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Edge Runtime](https://vercel.com/docs/functions/runtimes/edge-runtime)

### Helpful Guides
- [Vercel Function Timeout Guide](https://vercel.com/guides/what-can-i-do-about-vercel-serverless-functions-timing-out)
- [Next.js + Supabase Starter](https://vercel.com/templates/next.js/supabase)
- [Streaming with Vercel](https://vercel.com/blog/streaming-for-serverless-node-js-and-edge-runtimes-with-vercel-functions)

### Tools
- [Vercel CLI](https://vercel.com/docs/cli)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Upstash Workflow](https://upstash.com/docs/workflow/getstarted)

---

## Summary

**Bottom Line:**

Your stack (Next.js 14 + Supabase + Gemini AI + 30-90s operations) CAN work on Vercel free plan, BUT requires specific workarounds:

1. **AI Operations:** Edge Runtime + streaming (NOT standard serverless)
2. **File Uploads:** Direct to Supabase (NOT through Vercel)
3. **Cold Starts:** Accept them, optimize bundle, update Next.js
4. **DOCX Export:** Node.js runtime (Edge Runtime doesn't support)

**Upgrade to Pro ($20/mo) if:**
- Commercial project (required)
- Bandwidth > 100 GB/month
- Want better cold start experience (warm instances)
- Need advanced analytics

**Free plan works if:**
- Personal/non-commercial project
- Implement streaming for AI operations
- Direct file uploads to Supabase
- Accept occasional cold starts
- Bandwidth < 100 GB/month

Good luck with your deployment!
