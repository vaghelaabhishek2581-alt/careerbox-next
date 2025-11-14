# Email Notifications System

This document describes the email notification system implemented for course applications in CareerBox.

## Overview

When a user applies for a course through the institute detail page, the system now automatically sends:

1. **Confirmation email to the user** - Acknowledging their application submission
2. **Notification email to admin** - Alerting about the new application with user details

## Configuration

### Environment Variables

Add the following variables to your `.env.local` file:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="CareerBox" <noreply@careerbox.in>

# Admin Email for Notifications
ADMIN_EMAIL=admin@careerbox.in
```

### Gmail Setup

If using Gmail SMTP:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password as `SMTP_PASS`

## Email Templates

### User Confirmation Email

**Subject**: `Application Submitted Successfully - {Institute Name}`

**Content**:
- Welcome message with user's name
- Application details (ID, institute, course, status)
- Next steps in the admission process
- Support contact information

### Admin Notification Email

**Subject**: `New Course Application - {Institute Name}`

**Content**:
- Student details (name, email, phone, city)
- Application details (ID, institute, course)
- Eligibility exam scores (if provided)
- Link to admin dashboard to view application

## Implementation Details

### Files Modified

1. **`lib/services/email-service.ts`**
   - Added `sendCourseApplicationConfirmation()` function
   - Added `sendCourseApplicationAdminNotification()` function

2. **`lib/actions/student-leads.ts`**
   - Updated `createStudentLead()` to send emails after creating application
   - Added institute name fetching for better email content

3. **`.env.example`**
   - Updated with new SMTP configuration variables

### Email Flow

```
User submits application
         ↓
Application saved to database
         ↓
Fetch institute name from database
         ↓
Send confirmation email to user (async)
         ↓
Send notification email to admin (async)
         ↓
Return success response to user
```

## Testing

### Test API Endpoint

A test endpoint is available at `/api/test-email` for testing email functionality:

```bash
# Test user confirmation email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"type": "user", "email": "test@example.com"}'

# Test admin notification email
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"type": "admin", "email": "admin@example.com"}'
```

### Manual Testing

1. Set up environment variables
2. Start the development server
3. Navigate to an institute detail page
4. Fill out and submit the application form
5. Check both user and admin email inboxes

## Error Handling

- Email failures do not prevent application submission
- Errors are logged to console for debugging
- Users still receive success confirmation even if emails fail
- Email sending is asynchronous to avoid blocking the user experience

## Features

### User Email Features
- Professional HTML template with CareerBox branding
- Application ID for reference
- Clear next steps information
- Support contact details
- Mobile-responsive design

### Admin Email Features
- Detailed student information
- Application summary
- Eligibility exam scores
- Direct link to admin dashboard
- Professional notification format

## Customization

### Modifying Templates

Email templates can be customized in `lib/services/email-service.ts`:

- Update HTML content in the template functions
- Modify styling (inline CSS)
- Add or remove information fields
- Change branding elements

### Adding New Email Types

To add new email notifications:

1. Create new email template function in `email-service.ts`
2. Import and call the function where needed
3. Add appropriate error handling
4. Update this documentation

## Security Considerations

- Use App Passwords instead of regular passwords for Gmail
- Store sensitive credentials in environment variables
- Never commit email credentials to version control
- Use SMTP over TLS for secure email transmission
- Validate email addresses before sending

## Monitoring

- Check server logs for email sending status
- Monitor email delivery rates
- Set up alerts for email service failures
- Track bounce rates and spam complaints

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check SMTP credentials
   - Verify network connectivity
   - Check Gmail security settings

2. **Emails going to spam**
   - Set up SPF/DKIM records
   - Use proper from address
   - Avoid spam trigger words

3. **Template rendering issues**
   - Validate HTML syntax
   - Test with different email clients
   - Check inline CSS compatibility

### Debug Mode

Enable debug logging by adding to your environment:

```env
NODE_ENV=development
```

This will show detailed email sending logs in the console.
