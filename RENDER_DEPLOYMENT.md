# Deploying to Render (with Neon Database)

## Prerequisites

- Neon database already set up
- Neon database connection string (should look like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)

## Option 1: Using Render Blueprint (Recommended)

This repository includes a `render.yaml` file that automatically configures your web service.

### Steps:

1. **Push your code to GitHub** (if not already done)

   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push
   ```

2. **Create a Render account** at https://render.com

3. **Deploy using Blueprint**:
   - Go to https://dashboard.render.com/
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and create your web service

4. **Add your Neon database URL**:
   - After the service is created, go to your web service in Render dashboard
   - Go to "Environment" tab
   - Find `DATABASE_URL` and add your Neon connection string
   - Click "Save Changes" (this will trigger a redeploy)

5. **Run migrations** (after first deployment):
   - Go to your web service in Render dashboard
   - Click "Shell" tab
   - Run: `npm run migration:run`

6. **Update FRONTEND_URL**:
   - In the "Environment" tab, update `FRONTEND_URL` with your actual frontend URL
   - Or set to `*` to allow all origins during testing

## Option 2: Manual Setup

If you prefer manual configuration:

### Create Web Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `api` (or your preferred name)
   - **Environment**: Docker
   - **Region**: Choose closest to your Neon database region for better performance
   - **Branch**: main
   - **Root Directory**: leave empty
   - **Docker Build Context**: `.`
   - **Dockerfile Path**: `./Dockerfile`

4. **Environment Variables**:
   - `NODE_ENV` = `production`
   - `PORT` = `8080`
   - `DATABASE_URL` = [paste your Neon PostgreSQL connection string]
   - `FRONTEND_URL` = [your frontend URL or * for all origins]

5. Select Free plan (or paid if needed)
6. Click "Create Web Service"

### Run Database Migrations

After deployment:

1. Go to your web service → Shell tab
2. Run: `npm run migration:run`

## Important Notes

- **Neon Database**:
  - Your Neon database URL should include `?sslmode=require` at the end
  - Ensure your connection string includes the password
  - Neon free tier has some limitations (check Neon docs)

- **Free tier limitations (Render)**:
  - Services spin down after 15 minutes of inactivity
  - First request after spindown may take 30-60 seconds
- **Database connection**: Your `data-source.ts` already has `ssl: { rejectUnauthorized: false }` which works with Neon

- **Health checks**: Your API responds at `/api` for health checks

- **Logs**: View logs in the Render dashboard under the "Logs" tab

## Updating Your App

Simply push to your GitHub repository:

```bash
git add .
git commit -m "Update API"
git push
```

Render will automatically rebuild and redeploy your service.

## Troubleshooting

- **Database connection issues**:
  - Verify your Neon connection string is correct
  - Ensure `?sslmode=require` is in the connection string
  - Check that your Neon database is active (free tier may suspend)
- **CORS issues**: Update `FRONTEND_URL` environment variable

- **Build failures**: Check logs in Render dashboard

- **Migration errors**: Ensure migrations run after first deployment

- **Neon connection timeout**: Make sure your Neon database region is close to your Render service region

## Environment Variables Reference

| Variable     | Description                       | Example                                                               |
| ------------ | --------------------------------- | --------------------------------------------------------------------- |
| NODE_ENV     | Node environment                  | production                                                            |
| PORT         | Server port                       | 8080                                                                  |
| DATABASE_URL | Neon PostgreSQL connection string | postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require |
| FRONTEND_URL | Frontend URL for CORS             | https://yourfrontend.com                                              |
