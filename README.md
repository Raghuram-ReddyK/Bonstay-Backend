# Bonstay Backend

This is the backend for Bonstay - a comprehensive hotel booking and management system.

## Features

- User registration and authentication (regular users and admins)
- Admin code request and approval system
- Hotel management (CRUD operations)
- Review system for hotels
- Email notifications on registration

## Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env` file and update the values:
   ```env
   MONGODB_URI="your-mongodb-connection-string"
   ```

4. Set up email service (see Email Configuration section below)

5. Build the project:
   ```bash
   npm run build
   ```

6. Start the server:
   ```bash
   npm start
   ```

   Or for development:
   ```bash
   npm run dev
   ```

## Email Configuration

The application sends welcome emails to users upon registration. You need to configure email settings in your `.env` file.

### For Development (Recommended)

Use Ethereal (fake SMTP service for testing):

1. Run the email setup script:
   ```bash
   npm run setup-email
   ```

2. Copy the generated credentials to your `.env` file

3. Test emails will be sent to Ethereal's inbox. Check the console for preview URLs.

### For Production

Configure your actual email service:

#### Gmail
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@bonstay.com
```

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@bonstay.com
```

#### Other Providers
Check your email provider's SMTP documentation for the correct settings.

## API Endpoints

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/:userId` - Get user by ID

### Admin Codes
- `POST /api/admin-codes/requests` - Create admin code request
- `GET /api/admin-codes/requests` - Get all requests
- `PUT /api/admin-codes/requests/:id/approve` - Approve request
- `PUT /api/admin-codes/requests/:id/reject` - Reject request
- `GET /api/admin-codes` - Get all admin codes
- `POST /api/admin-codes/use` - Use admin code
- `GET /api/admin-codes/validate/:code` - Validate admin code

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/search` - Search hotels
- `GET /api/hotels/:id` - Get hotel by ID
- `POST /api/hotels` - Create hotel (Admin only)
- `PUT /api/hotels/:id` - Update hotel (Admin only)
- `DELETE /api/hotels/:id` - Delete hotel (Admin only)
- `POST /api/hotels/:id/reviews` - Add hotel review

## Testing

Import the `Bonstay-API.postman_collection.json` file into Postman to test all endpoints.

## License

ISC