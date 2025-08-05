# Payment System Testing Guide

## Overview

This guide will help you test the complete payment system including wallet recharge and course purchases using Stripe and PayPal.

## Prerequisites

### 1. Environment Setup

Make sure you have the following environment variables set in your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install @stripe/react-stripe-js @stripe/stripe-js @paypal/react-paypal-js
```

## Testing Flow

### Step 1: Start the Servers

1. **Start Backend Server:**

   ```bash
   cd backend
   npm start
   ```

   Server should start on `http://localhost:5000`

2. **Start Frontend Server:**
   ```bash
   cd frontend
   npm start
   ```
   App should open on `http://localhost:3000`

### Step 2: User Registration/Login

1. **Register a new user:**

   - Go to `http://localhost:3000/register`
   - Fill in the registration form
   - Choose role: "student" or "teacher"

2. **Login:**
   - Go to `http://localhost:3000/login`
   - Use your credentials to log in

### Step 3: Test Wallet Recharge

#### Option A: Stripe Payment (Recommended for Testing)

1. **Navigate to Wallet:**

   - After login, go to your dashboard
   - Click on "Wallet" or navigate to `/wallet`

2. **Test Stripe Recharge:**

   - Click "Recharger" button
   - Enter amount (e.g., 10€)
   - Click "Payer avec Carte Bancaire"
   - Use Stripe test card numbers:
     - **Success:** `4242 4242 4242 4242`
     - **Decline:** `4000 0000 0000 0002`
     - **Expiry:** Any future date (e.g., 12/25)
     - **CVC:** Any 3 digits (e.g., 123)

3. **Verify Transaction:**
   - Check wallet balance is updated
   - Check transaction history shows the deposit

#### Option B: PayPal Payment

1. **Test PayPal Recharge:**
   - In the recharge modal, use PayPal button
   - Use PayPal Sandbox account:
     - **Email:** sb-xxxxx@business.example.com
     - **Password:** (provided in PayPal developer dashboard)

### Step 4: Test Course Purchase

#### Prerequisites for Course Testing

1. **Create a Test Course:**

   - Login as a teacher
   - Go to course creation page
   - Create a course with a price (e.g., 25€)

2. **Switch to Student Account:**
   - Logout and login as a student
   - Or register a new student account

#### Test Course Purchase Flow

1. **Browse Courses:**

   - Go to `/courses`
   - Find the course you created

2. **Purchase with Wallet:**

   - If wallet has sufficient funds
   - Click "Acheter" button
   - Choose "Payer avec Wallet"
   - Verify purchase is completed

3. **Purchase with Stripe:**

   - If wallet has insufficient funds
   - Choose "Payer avec Carte Bancaire"
   - Use test card: `4242 4242 4242 4242`
   - Complete payment flow

4. **Purchase with PayPal:**
   - Choose "Payer avec PayPal"
   - Complete PayPal flow

### Step 5: API Testing with Postman/Thunder Client

#### Wallet Endpoints

1. **Get Wallet Balance:**

   ```
   GET /api/wallet
   Headers: Authorization: Bearer <your_jwt_token>
   ```

2. **Get Transaction History:**
   ```
   GET /api/wallet/transactions
   Headers: Authorization: Bearer <your_jwt_token>
   ```

#### Payment Endpoints

1. **Create Stripe Payment Intent:**

   ```
   POST /api/payments/stripe/create-payment-intent
   Headers:
     - Authorization: Bearer <your_jwt_token>
     - Content-Type: application/json
   Body: {
     "amount": 10
   }
   ```

2. **Confirm Stripe Payment:**

   ```
   POST /api/payments/stripe/confirm-payment
   Headers:
     - Authorization: Bearer <your_jwt_token>
     - Content-Type: application/json
   Body: {
     "paymentIntentId": "pi_..."
   }
   ```

3. **Create PayPal Order:**

   ```
   POST /api/payments/paypal/create-order
   Headers:
     - Authorization: Bearer <your_jwt_token>
     - Content-Type: application/json
   Body: {
     "amount": 10
   }
   ```

4. **Capture PayPal Payment:**
   ```
   POST /api/payments/paypal/capture-payment
   Headers:
     - Authorization: Bearer <your_jwt_token>
     - Content-Type: application/json
   Body: {
     "orderId": "PAY-..."
   }
   ```

## Test Scenarios

### 1. Happy Path Testing

- ✅ User registers and logs in
- ✅ User recharges wallet with Stripe
- ✅ User recharges wallet with PayPal
- ✅ User purchases course with wallet funds
- ✅ User purchases course with Stripe
- ✅ User purchases course with PayPal
- ✅ Transaction history is updated
- ✅ Wallet balance is correct

### 2. Error Handling Testing

- ❌ Invalid payment card (should show error)
- ❌ Insufficient funds (should prevent purchase)
- ❌ Network errors (should handle gracefully)
- ❌ Invalid amounts (should validate)

### 3. Edge Cases

- 🔄 Multiple simultaneous payments
- 🔄 Payment timeout scenarios
- 🔄 Browser refresh during payment
- 🔄 Duplicate purchase attempts

## Stripe Test Cards

| Card Number         | Description               | Expected Result     |
| ------------------- | ------------------------- | ------------------- |
| 4242 4242 4242 4242 | Visa (success)            | ✅ Payment succeeds |
| 4000 0000 0000 0002 | Visa (declined)           | ❌ Payment fails    |
| 4000 0000 0000 9995 | Visa (insufficient funds) | ❌ Payment fails    |
| 4000 0000 0000 9987 | Visa (expired card)       | ❌ Payment fails    |
| 4000 0000 0000 9979 | Visa (incorrect CVC)      | ❌ Payment fails    |

## PayPal Sandbox Accounts

1. **Business Account:** Used for receiving payments
2. **Personal Account:** Used for making payments

Get these from your PayPal Developer Dashboard.

## Troubleshooting

### Common Issues

1. **"elements is not defined" Error:**

   - Make sure `@stripe/react-stripe-js` is installed
   - Check that Elements component wraps Stripe components

2. **Payment Intent Creation Fails:**

   - Verify STRIPE_SECRET_KEY is correct
   - Check backend server is running
   - Verify JWT token is valid

3. **PayPal Integration Issues:**

   - Verify PayPal credentials in .env
   - Check PayPal app is configured for sandbox
   - Ensure CORS is properly configured

4. **Wallet Balance Not Updating:**
   - Check database connection
   - Verify wallet model is working
   - Check transaction creation logic

### Debug Steps

1. **Check Browser Console:**

   - Look for JavaScript errors
   - Check network requests

2. **Check Backend Logs:**

   - Monitor server console output
   - Check for error messages

3. **Check Database:**

   - Verify wallet documents are created
   - Check transaction records

4. **Test API Endpoints:**
   - Use Postman/Thunder Client
   - Verify responses match expected format

## Next Steps

After successful testing:

1. **Production Setup:**

   - Switch to live Stripe keys
   - Switch to live PayPal credentials
   - Update webhook endpoints

2. **Security Review:**

   - Implement rate limiting
   - Add input validation
   - Secure sensitive endpoints

3. **Monitoring:**
   - Set up error tracking
   - Monitor payment success rates
   - Track user behavior

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console and server logs
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed
