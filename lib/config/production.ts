// Production Configuration
export const PRODUCTION_CONFIG = {
  // Performance Optimization
  performance: {
    // Code Splitting
    codeSplitting: {
      enabled: true,
      chunkSize: 244 * 1024, // 244KB
      maxChunks: 10,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    },

    // Image Optimization
    imageOptimization: {
      enabled: true,
      formats: ['webp', 'avif'],
      quality: 80,
      sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      placeholder: 'blur',
      lazy: true,
    },

    // Caching Strategy
    caching: {
      static: {
        maxAge: 31536000, // 1 year
        immutable: true,
      },
      api: {
        maxAge: 300, // 5 minutes
        staleWhileRevalidate: 86400, // 1 day
      },
      pages: {
        maxAge: 0,
        mustRevalidate: true,
      },
    },

    // Bundle Analysis
    bundleAnalysis: {
      enabled: process.env.NODE_ENV === 'production',
      threshold: {
        warnings: 1000000, // 1MB
        errors: 2000000, // 2MB
      },
    },
  },

  // Security Configuration
  security: {
    // Rate Limiting
    rateLimiting: {
      api: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
      },
      auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // limit each IP to 5 auth requests per windowMs
      },
      payment: {
        windowMs: 60 * 1000, // 1 minute
        max: 3, // limit each IP to 3 payment requests per minute
      },
    },

    // CORS Configuration
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },

    // Content Security Policy
    csp: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://checkout.razorpay.com",
          "https://js.stripe.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: [
          "'self'",
          "https://api.razorpay.com",
          "wss://localhost:3000",
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        ],
        frameSrc: ["'self'", "https://checkout.razorpay.com"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },

    // Input Validation
    validation: {
      maxStringLength: 10000,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      sanitizeHtml: true,
      preventXSS: true,
    },

    // Session Security
    session: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  },

  // Database Configuration
  database: {
    // Connection Pool
    connectionPool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 200,
    },

    // Query Optimization
    queryOptimization: {
      slowQueryThreshold: 1000, // 1 second
      maxQueryTime: 30000, // 30 seconds
      enableQueryLogging: process.env.NODE_ENV === 'development',
    },

    // Indexing Strategy
    indexing: {
      users: ['email', 'role', 'createdAt', 'lastActive'],
      businesses: ['userId', 'status', 'isVerified', 'createdAt'],
      institutes: ['userId', 'status', 'isVerified', 'createdAt'],
      jobs: ['businessId', 'status', 'deadline', 'createdAt'],
      courses: ['instituteId', 'status', 'category', 'createdAt'],
      applications: ['userId', 'jobId', 'status', 'createdAt'],
      payments: ['userId', 'status', 'createdAt', 'amount'],
    },
  },

  // Monitoring & Analytics
  monitoring: {
    // Error Tracking
    errorTracking: {
      sentry: {
        enabled: process.env.NODE_ENV === 'production',
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
        profilesSampleRate: 0.1,
      },
    },

    // Performance Monitoring
    performanceMonitoring: {
      enabled: true,
      sampleRate: 0.1,
      metrics: {
        pageLoad: true,
        apiResponse: true,
        databaseQuery: true,
        userInteraction: true,
      },
    },

    // User Analytics
    userAnalytics: {
      enabled: true,
      trackEvents: [
        'page_view',
        'user_signup',
        'user_login',
        'job_application',
        'course_enrollment',
        'payment_completed',
        'subscription_upgrade',
      ],
      privacyCompliant: true,
      anonymizeIP: true,
    },

    // Health Checks
    healthChecks: {
      enabled: true,
      interval: 30000, // 30 seconds
      endpoints: [
        '/api/health',
        '/api/health/database',
        '/api/health/redis',
        '/api/health/payment',
      ],
    },
  },

  // Email Configuration
  email: {
    // SMTP Settings
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },

    // Email Limits
    limits: {
      dailyLimit: 10000,
      hourlyLimit: 1000,
      perUserLimit: 50,
      rateLimitWindow: 60 * 60 * 1000, // 1 hour
    },

    // Email Templates
    templates: {
      cacheEnabled: true,
      cacheTTL: 3600, // 1 hour
      fallbackLanguage: 'en',
    },
  },

  // Payment Configuration
  payment: {
    // Razorpay
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID,
      keySecret: process.env.RAZORPAY_KEY_SECRET,
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
      timeout: 30000, // 30 seconds
      retryAttempts: 3,
    },

    // PayU (Backup)
    payu: {
      merchantId: process.env.PAYU_MERCHANT_ID,
      key: process.env.PAYU_KEY,
      salt: process.env.PAYU_SALT,
      timeout: 30000,
      retryAttempts: 3,
    },

    // Payment Security
    security: {
      webhookVerification: true,
      signatureValidation: true,
      amountValidation: true,
      currencyValidation: true,
    },
  },

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
  },

  // CDN Configuration
  cdn: {
    enabled: process.env.NODE_ENV === 'production',
    baseUrl: process.env.CDN_BASE_URL,
    imageOptimization: true,
    compression: true,
    cacheControl: 'public, max-age=31536000, immutable',
  },

  // Logging Configuration
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: 'json',
    transports: {
      console: {
        enabled: process.env.NODE_ENV === 'development',
      },
      file: {
        enabled: process.env.NODE_ENV === 'production',
        filename: 'logs/app.log',
        maxSize: '20m',
        maxFiles: 5,
      },
      remote: {
        enabled: process.env.NODE_ENV === 'production',
        endpoint: process.env.LOG_ENDPOINT,
      },
    },
  },

  // Feature Flags
  features: {
    realTimeNotifications: true,
    advancedSearch: true,
    paymentGateway: true,
    emailTemplates: true,
    systemHealthMonitoring: true,
    userAnalytics: true,
    bulkOperations: true,
    apiRateLimiting: true,
    contentModeration: true,
    auditLogging: true,
  },

  // Environment Specific
  environment: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    nodeEnv: process.env.NODE_ENV,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  },
};

// Export individual configurations for easier access
export const {
  performance,
  security,
  database,
  monitoring,
  email,
  payment,
  redis,
  cdn,
  logging,
  features,
  environment,
} = PRODUCTION_CONFIG;

// Utility functions
export const isFeatureEnabled = (feature: keyof typeof features): boolean => {
  return features[feature];
};

export const getConfigValue = <T>(path: string, defaultValue: T): T => {
  const keys = path.split('.');
  let value: any = PRODUCTION_CONFIG;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      return defaultValue;
    }
  }
  
  return value as T;
};

export const validateEnvironment = (): boolean => {
  const requiredEnvVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'MONGODB_URI',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    return false;
  }
  
  return true;
};
