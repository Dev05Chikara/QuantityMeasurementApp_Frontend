# Google Sign-In Setup Guide

## Overview
This guide will help you set up Google Sign-In (OAuth 2.0) for your Quantity Measurement App.

## Prerequisites
- A Google Cloud Console account
- A project in Google Cloud Console

## Step 1: Create a Google Cloud Project (if not already done)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on **Select a Project** → **New Project**
3. Enter your project name and click **Create**

## Step 2: Enable Google OAuth 2.0
1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **Google Identity Services API**
3. Click on it and press **Enable**

## Step 3: Create OAuth Consent Screen
1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** as User Type
3. Fill in the required fields:
   - **App name**: Quantity Measurement App
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**
5. Skip optional scopes and click **Save and Continue** again
6. Click **Back to Dashboard**

## Step 4: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Select **Web application** as Application type
4. Name it: `Quantity Measurement Front-end`
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - Your production domain (e.g., `https://yourdomain.com`)
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/`
   - `http://127.0.0.1:3000/`
   - Your production URLs
7. Click **Create**
8. Copy your **Client ID** from the popup that appears

## Step 5: Configure Frontend
1. Open `wwwroot/login.html`
2. Find this line:
   ```html
   <div id="g_id_onload" class="google-signin-container"
     data-client_id="YOUR_GOOGLE_CLIENT_ID"
     data-callback="handleGoogleSignIn">
   </div>
   ```
3. Replace `YOUR_GOOGLE_CLIENT_ID` with the Client ID you copied
4. Do the same in `wwwroot/signup.html`

## Step 6: Configure Backend
Your backend needs to handle Google Sign-In tokens. The frontend will send POST requests to:
- **Endpoint**: `/api/auth/google-login`
- **Body**: 
  ```json
  {
    "idToken": "Google ID Token"
  }
  ```

Backend should:
1. Verify the Google ID token using Google's verification API
2. Extract user information (email, name, etc.)
3. Create/update user in your database
4. Return:
   ```json
   {
     "Token": "Your JWT Token",
     "Username": "User email or name"
   }
   ```

## Example Backend Implementation (Node.js/Express)

```javascript
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('YOUR_GOOGLE_CLIENT_ID');

app.post('/api/auth/google-login', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: 'YOUR_GOOGLE_CLIENT_ID'
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    
    // Check if user exists, create if not
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        username: email,
        email: email,
        name: name,
        googleId: payload.sub,
        profilePicture: picture
      });
      await user.save();
    } else {
      // Update if needed
      user.googleId = payload.sub;
      await user.save();
    }
    
    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      'YOUR_JWT_SECRET',
      { expiresIn: '7d' }
    );
    
    res.json({
      Token: token,
      Username: user.username
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

## Testing
1. Start your frontend development server
2. Navigate to `http://localhost:3000/login.html` or `http://localhost:3000/signup.html`
3. You should see a "Sign in with Google" button
4. Click it and sign in with your Google account
5. Check that your backend receives the token correctly

## Troubleshooting

### "Uncaught SyntaxError: Unexpected token '<'" 
- This usually means the Google SDK didn't load. Check that your domain is in the OAuth consent screen authorized JavaScript origins.

### "OAuth 2.0 error occurred"
- Make sure your Client ID is correct
- Ensure your domain is properly authorized

### "The redirect URI doesn't match"
- Add your current domain to the authorized JavaScript origins and redirect URIs in Google Cloud Console

## Security Notes
- Never expose your Client Secret in frontend code
- Always verify tokens on the backend
- Store the JWT token securely in localStorage
- Consider using HttpOnly cookies for production

## References
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Identity Services Library](https://developers.google.com/identity/gsi/web)
