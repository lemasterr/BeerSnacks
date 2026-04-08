# Cloudflare R2 Setup Guide

## Overview
Images uploaded via the admin panel are stored in Cloudflare R2 object storage.

## Credentials Provided
- **Account ID**: `025229e3c29465a894106a51f4e549ba`
- **S3 API Endpoint**: `https://025229e3c29465a894106a51f4e549ba.r2.cloudflarestorage.com`
- **Bucket Name**: `beersnacks-images`

## Configuration Files

### 1. wrangler.toml
The main Wrangler configuration includes the R2 bucket binding:
```toml
[[r2_buckets]]
binding = "IMAGES_BUCKET"
bucket_name = "beersnacks-images"
account_id = "025229e3c29465a894106a51f4e549ba"
```

### 2. .env (Local Development)
Create a `.env` file in the project root with your R2 credentials:
```
CLOUDFLARE_API_TOKEN=your_token_here
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
```

## How Image Upload Works

1. Admin uploads image via `/api/admin/upload` endpoint
2. The server receives the file as multipart/form-data
3. File is sanitized and stored in R2 bucket
4. Returns the image path: `img/filename.png`
5. Path is saved in the product catalog

## Cloudflare R2 Management

### Create S3 API Tokens
1. Go to Cloudflare Dashboard → R2
2. Click "Manage R2 API Tokens"
3. Create a new token with:
   - Permission: "Object Read & Write"
   - Apply to: "beersnacks-images" bucket

### Accessing Files
Public R2 URLs format:
```
https://025229e3c29465a894106a51f4e549ba.r2.cloudflarestorage.com/img/product_name.png
```

Or with custom domain if configured:
```
https://images.yoursite.com/img/product_name.png
```

## Testing Upload

```bash
# Local development with Wrangler
wrangler pages dev public

# Test upload endpoint
curl -X POST http://localhost:8788/api/admin/upload \
  -F "file=@path/to/image.png" \
  -F "filename=test_image.png"
```

## Production Deployment

1. Push code to git
2. Cloudflare Pages automatically deploys
3. R2 binding is configured and ready
4. Uploaded images are stored in R2 and served from Pages

## Troubleshooting

- **Upload returns "No R2 bucket configured"**: Check that `IMAGES_BUCKET` binding is set in wrangler.toml
- **Auth errors**: Verify API token has correct permissions
- **Images not appearing**: Check R2 bucket settings and CORS if using custom domain
