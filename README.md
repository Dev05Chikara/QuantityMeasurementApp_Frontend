# QuantityMeasurementApp_Frontend

Multi-page frontend web application for quantity measurement operations built with HTML, CSS, JavaScript, and JSON Server.

## Features

- Home landing page with app overview and quick start.
- Operation selection page for:
	- Convert
	- Compare
	- Arithmetic Operations
- Convert module supports:
	- Length
	- Volume
	- Weight
	- Temperature
- Compare module supports quantity comparison output:
	- Equal
	- Greater
	- Lesser
- Arithmetic module supports:
	- Addition
	- Subtraction
- Business rule enforced: temperature arithmetic is not allowed.
- Basic authentication UI:
	- Signup
	- Login
	- Simple frontend validation
- Protected history page:
	- Requires logged-in user
	- Stores and fetches operation history from JSON Server

## Project Structure

- wwwroot/index.html (Home page)
- wwwroot/operations.html (Operation selection)
- wwwroot/convert.html (Convert module)
- wwwroot/compare.html (Compare module)
- wwwroot/arithmetic.html (Arithmetic module)
- wwwroot/login.html (Login page)
- wwwroot/signup.html (Signup page)
- wwwroot/history.html (Protected history page)
- wwwroot/styles.css (Shared styling)
- wwwroot/js/common.js (Shared logic and API helpers)
- wwwroot/js/convert.js (Convert logic)
- wwwroot/js/compare.js (Compare logic)
- wwwroot/js/arithmetic.js (Arithmetic logic)
- wwwroot/js/auth.js (Login/Signup logic)
- wwwroot/js/history.js (History fetch/render logic)
- db.json (Mock backend data)

## Setup and Run

1. Install dependencies:

	 npm install

2. Start JSON Server backend:

	 npm run start:api

3. Serve frontend in another terminal:

	 npm run start:web

4. Open the app in browser:

	http://localhost:5500

## Backend-Friendly Layout

The frontend now lives under `wwwroot/`, which makes it easy to drop into a backend project that serves static files from a web root folder such as `wwwroot`.

## JSON Server Data

JSON Server (`db.json`) stores:

- `users`: login and signup user data
- `history`: operation history entries per user

Default demo user:

- Email: demo@qma.com
- Password: demo123
