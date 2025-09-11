# CareerBox - Comprehensive Educational Platform

A production-ready, multi-role educational platform built with Next.js 14, TypeScript, and modern web technologies.

## 🚀 Features

### Core Features
- **Multi-Role Dashboard System**: Students, Business Owners, Institute Administrators, System Admins
- **Lead Management System**: Automated lead conversion for businesses and institutes
- **Subscription Management**: Flexible billing with Indian payment gateways
- **Real-time Communication**: Socket.IO powered notifications
- **Universal Search**: Advanced search across all platform entities
- **Unique Profile System**: Public profile URLs with role-specific layouts

### Advanced Features
- **Payment Gateway Integration**: Razorpay with PayU backup
- **Email Template System**: TipTap rich text editor
- **System Health Monitoring**: Real-time performance metrics
- **Comprehensive Analytics**: User behavior and platform statistics
- **Security & Performance**: Production-ready optimizations

## 🏗️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI Components**: ShadCN/UI with Tailwind CSS
- **State Management**: Redux Toolkit with RTK Query
- **Authentication**: Next-Auth.js with RBAC
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for live updates
- **Payments**: Razorpay integration
- **Email**: SMTP with customizable templates
- **Monitoring**: Sentry integration

## 🎯 User Roles

### 1. Students/Professionals
- Profile management with work experience and education
- Job applications and course enrollment
- Networking and activity tracking
- Premium upgrade options

### 2. Business Owners (Subscription Required)
- Business profile and job posting
- Candidate management and exam creation
- Analytics dashboard and subscription management

### 3. Institute Administrators (Subscription Required)
- Institute profile and course management
- Student enrollment and exam system
- Academic analytics and bulk operations

### 4. System Administrators
- Lead management and user oversight
- System health monitoring
- Email template management
- Platform analytics

## 💳 Payment System

### Supported Methods
- Credit/Debit Cards (Visa, Mastercard, RuPay)
- UPI (PhonePe, Google Pay, Paytm)
- Net Banking (All major Indian banks)
- Digital Wallets (Paytm, Mobikwik)

### Subscription Plans
- **Business**: ₹2,999/month, ₹7,999/quarter, ₹29,999/year
- **Institute**: ₹4,999/month, ₹12,999/quarter, ₹49,999/year
- **Premium Student**: ₹299/month, ₹799/quarter, ₹2,999/year

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB database
- Redis server (optional)
- SMTP server for emails
- Razorpay account

### Installation

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-username/careerbox-next.git
   cd careerbox-next
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure environment variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/careerbox
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=http://localhost:3000
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   SMTP_HOST=your-smtp-host
   SMTP_USER=your-smtp-user
   SMTP_PASS=your-smtp-password
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Create account and explore features

## 📚 Project Structure

```
careerbox-next/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Dashboard pages
│   ├── profile/           # Public profiles
│   └── search/            # Search results
├── components/            # React Components
│   ├── dashboard/         # Dashboard components
│   ├── forms/             # Form components
│   ├── search/            # Search components
│   ├── payment/           # Payment components
│   └── admin/             # Admin components
├── lib/                   # Utilities
│   ├── auth/              # Authentication
│   ├── db/                # Database
│   ├── redux/             # Redux store
│   ├── types/             # TypeScript types
│   ├── payment/           # Payment integration
│   └── config/            # Configuration
└── hooks/                 # Custom hooks
```

## 🛡️ Security & Performance

### Security
- Role-Based Access Control
- Rate Limiting and Input Validation
- XSS and CSRF Protection
- Secure Payment Processing

### Performance
- Code Splitting and Lazy Loading
- Image Optimization and Caching
- Redis for Session Management
- CDN Integration

## 📈 Monitoring

- **Error Tracking**: Sentry integration
- **Performance Monitoring**: Real-time metrics
- **User Analytics**: Behavior tracking
- **System Health**: Infrastructure monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- [GitHub Issues](https://github.com/your-username/careerbox-next/issues)
- [Documentation](docs/)
- [Email Support](mailto:support@careerbox.com)

---

**CareerBox** - Empowering careers through technology and education. Built with ❤️ for the future of work and learning.