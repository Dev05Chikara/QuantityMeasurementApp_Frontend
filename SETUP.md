# Quantity Measurement App - Frontend Setup Guide

## Overview
This is a modern web frontend for the Quantity Measurement App that connects to the .NET backend API. The frontend provides a clean UI for unit conversion, quantity comparison, and arithmetic operations.

## Architecture

### Structure
```
wwwroot/
├── index.html          # Home page
├── operations.html     # Operation selection page
├── convert.html        # Unit conversion module
├── compare.html        # Quantity comparison module
├── arithmetic.html     # Arithmetic operations module
├── history.html        # Operation history page
├── login.html          # Login page
├── signup.html         # Registration page
├── styles.css          # Global styling
└── js/
    ├── common.js       # Shared utilities, API config, JWT handling
    ├── auth.js         # Authentication logic
    ├── convert.js      # Conversion module logic
    ├── compare.js      # Comparison module logic
    ├── arithmetic.js   # Arithmetic module logic
    └── history.js      # History page logic
```

## Prerequisites

1. **.NET Backend** - The backend API must be running
   - Backend location: `c:\QuantityMeasurementApp`
   - Required endpoints: `/api/Auth/login`, `/api/Auth/register`, `/api/QuantityMeasurements/*`
   - Default URL: `https://localhost:5001`

2. **Web Server** - To serve the frontend files
   - Recommended: Python HTTP Server, Node.js http-server, or IIS
   - DO NOT open HTML files directly in browser (authentication won't work due to CORS)

3. **CORS Configuration** - The backend must allow requests from the frontend origin

## Running the Frontend

### Option 1: Using Python (Recommended for Development)
```bash
cd c:\QuantityMeasurementApp_Frontend\wwwroot
python -m http.server 8080
```
Access at: `http://localhost:8080`

### Option 2: Using Node.js http-server
```bash
npm install -g http-server
cd c:\QuantityMeasurementApp_Frontend\wwwroot
http-server -p 8080
```
Access at: `http://localhost:8080`

### Option 3: Using IIS
1. Create a new IIS website pointing to `c:\QuantityMeasurementApp_Frontend\wwwroot`
2. Set the binding to your desired port
3. Ensure CORS headers are properly configured in the backend

## Backend Integration

### API Base URL
The frontend is configured to connect to the backend at:
```
https://localhost:5001/api
```

To change this, edit `wwwroot/js/common.js`:
```javascript
const API_BASE_URL = "https://localhost:5001/api";
```

### Available Endpoints
The frontend expects these backend endpoints:

- **Authentication**
  - `POST /auth/login` - User login
  - `POST /auth/register` - User registration

- **Quantity Operations** (Requires JWT Token)
  - `POST /quantitymeasurements/convert` - Unit conversion
  - `POST /quantitymeasurements/compare` - Quantity comparison
  - `POST /quantitymeasurements/add` - Addition
  - `POST /quantitymeasurements/subtract` - Subtraction
  - `GET /quantitymeasurements/history` - Operation history

### JWT Authentication
- JWT tokens are stored in `localStorage` with key `authToken`
- All protected endpoints automatically include the token in the `Authorization` header
- Expired/invalid tokens trigger a redirect to login page
- Token is removed when user clicks "Logout"

## Features

### 1. Authentication
- User registration with username and password (min 6 characters)
- Secure login with JWT token generation
- Session management with automatic logout on token expiration
- Password confirmation on signup

### 2. Unit Conversion
- Support for Length, Volume, Weight, and Temperature
- Interactive card-based measurement type selection
- Real-time unit population based on selected type
- Backend-validated conversions

### 3. Quantity Comparison
- Compare two quantities of the same type
- Results: Equal, Greater, or Lesser
- Automatic unit normalization
- Backend processing for accuracy

### 4. Arithmetic Operations
- Addition and subtraction of quantities
- Automatic unit conversion to first operand's unit
- Temperature arithmetic restricted (by business rule)
- Real-time result calculation and display

### 5. Operation History
- View all past operations with timestamps
- Displays: Time, Operation Type, Measurement Type, Input, Output
- Sorted by most recent first
- Requires authentication to access

## User Interface

### Card-Based Measurement Selection
Instead of traditional dropdowns, the app uses interactive cards for measurement type selection:
- Hover effects for visual feedback
- Click to select (active state with accent color)
- Disabled state for unsupported operations (e.g., Temperature in Arithmetic)
- Responsive grid layout

### Dark Theme
- Modern dark interface with accent colors (Cyan & Orange)
- Glassmorphism effects for surface elements
- Smooth animations and transitions
- Mobile-responsive design

### Navigation
- Dynamic navigation based on authentication status
- Hidden Login/Signup links when authenticated
- Logout button appears after login
- Quick access to all modules

## Development

### Adding New Measurement Types
1. Add unit definitions to `common.js` in `UNIT_DEFINITIONS`
2. Add unit labels to `UNIT_LABELS`
3. Add mapping to `mapUnitToBackendFormat()`
4. Add card to respective HTML pages
5. Ensure backend supports the new type

### Modifying API Endpoints
1. All API calls go through `apiRequest()` function in `common.js`
2. Function automatically handles:
   - JWT token injection
   - Error handling
   - Session redirect on 401
3. Update endpoint paths in individual module files

### Styling
- Global styles in `styles.css`
- CSS Custom Properties (Variables) for consistent theming
- Responsive breakpoints for mobile support
- Animation definitions at bottom of CSS file

## Troubleshooting

### "Session expired. Please login again"
- Backend JWT token has expired
- Solution: Login again

### "Request failed" on operations
- Backend is not running or API URL is incorrect
- Solution: Start the .NET backend and verify `API_BASE_URL` in common.js

### CORS errors in browser console
- Backend doesn't allow requests from frontend origin
- Solution: Configure CORS in backend's Program.cs

### Cards not selecting
- JavaScript may not be loading properly
- Solution: Check browser console for errors, refresh page

### History page is empty
- No operations saved yet
- Solution: Perform some operations first

## Security Considerations

1. **HTTPS Only** - Change `http://` to `https://` in production
2. **Token Storage** - Tokens in localStorage (consider secure cookies)
3. **Input Validation** - All inputs validated on frontend and backend
4. **CORS Headers** - Only allow requests from trusted origins
5. **Session Timeout** - Implement server-side token expiration

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Related Documentation
- Backend Setup: `c:\QuantityMeasurementApp\README.md`
- Deployment Guide: `c:\QuantityMeasurementApp\DEPLOYMENT_GUIDE.md`

## Support
For issues or questions:
1. Check browser console (F12) for error messages
2. Verify backend is running and accessible
3. Ensure JWT token is valid in localStorage
4. Check CORS configuration in backend
