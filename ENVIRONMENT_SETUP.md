# Environment Configuration Guide

This document explains how to set up and manage environment variables for the Quantity Measurement App frontend.

## Overview

The application uses Angular environment files to manage configuration across different environments (development, production). All hardcoded values have been removed and externalized into configuration files.

## Files

- `src/environments/environment.ts` - Development environment configuration
- `src/environments/environment.prod.ts` - Production environment configuration
- `.env.example` - Template for environment variables (for reference)

## Configuration

### Development (Default)

The development environment uses `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  googleClientId: '453747910306-nu3epkkudc4hid5akvbrka7pej7k3dum.apps.googleusercontent.com'
};
```

**To update for local development:**
1. Edit `src/environments/environment.ts`
2. Update `apiUrl` to point to your local backend URL
3. Update `googleClientId` with your Google OAuth Client ID

### Production

The production environment uses `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID_HERE'
};
```

**To update for production deployment:**
1. Edit `src/environments/environment.prod.ts`
2. Update `apiUrl` to your production API URL
3. Update `googleClientId` with your production Google OAuth Client ID

## Running the Application

### Development Mode
```bash
npm start
# or
ng serve
```
This automatically uses `src/environments/environment.ts`

### Production Build
```bash
npm run build
# or
ng build --configuration production
```
This automatically uses `src/environments/environment.prod.ts`

### Production Mode Locally (for testing)
```bash
ng serve --configuration production
```

## Where Configuration is Used

### API Service (`src/app/core/services/api.service.ts`)
Imports the environment to get the API base URL:
```typescript
import { environment } from '../../../environments/environment';

private readonly apiBaseUrl = environment.apiUrl;
```

### Google Auth Service (`src/app/core/services/google-auth.service.ts`)
Imports the environment to get the Google Client ID:
```typescript
import { environment } from '../../../environments/environment';

private getClientId(): string {
  const clientId = environment.googleClientId?.trim();
  // ... validation
  return clientId;
}
```

## Best Practices

1. **Never commit sensitive values** - Always use `.env.example` as a template
2. **Keep `.env.local` in `.gitignore`** - This is already configured
3. **Use appropriate URLs** - Make sure production builds use production URLs
4. **Validate configuration** - The services validate that required config values are present

## Google OAuth Setup

Before using Google authentication, you need to:

1. Create a Google OAuth 2.0 Client ID from the [Google Cloud Console](https://console.cloud.google.com/)
2. Add authorized JavaScript origins and redirect URIs for your domain
3. Update the `googleClientId` in the appropriate environment file

## Environment Variables Reference

| Variable | Development | Production | Description |
|----------|-------------|-----------|-------------|
| `apiUrl` | `http://localhost:5000/api` | `https://api.yourdomain.com/api` | Backend API endpoint |
| `googleClientId` | Your dev client ID | Your prod client ID | Google OAuth 2.0 Client ID |
| `production` | `false` | `true` | Angular production mode flag |
