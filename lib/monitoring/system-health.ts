import { connectToDatabase } from '@/lib/db/mongodb';
import { getPaymentDetails } from '@/lib/payment/razorpay';

export interface SystemHealth {
  api: {
    status: 'healthy' | 'degraded' | 'down';
    responseTime: number;
    uptime: number;
    errorRate: number;
  };
  database: {
    status: 'healthy' | 'degraded' | 'down';
    connectionCount: number;
    queryTime: number;
    size: number;
  };
  server: {
    cpu: number;
    memory: number;
    disk: number;
    uptime: number;
  };
  payment: {
    razorpay: 'healthy' | 'degraded' | 'down';
    payu: 'healthy' | 'degraded' | 'down';
    successRate: number;
  };
}

export async function getSystemHealth(): Promise<SystemHealth> {
  try {
    // Test database connection
    const dbStart = Date.now();
    const { db } = await connectToDatabase();
    const dbQueryTime = Date.now() - dbStart;
    
    // Get database stats
    const dbStats = await db.stats();
    const connectionCount = await db.admin().serverStatus().then(status => status.connections?.current || 0);
    
    // Test API response time
    const apiStart = Date.now();
    await db.collection('users').findOne({});
    const apiResponseTime = Date.now() - apiStart;
    
    // Check payment gateway status
    const paymentStatus = await checkPaymentGatewayStatus();
    
    // Get server metrics (simulated - in production, use actual system monitoring)
    const serverMetrics = await getServerMetrics();
    
    return {
      api: {
        status: apiResponseTime < 1000 ? 'healthy' : apiResponseTime < 3000 ? 'degraded' : 'down',
        responseTime: apiResponseTime,
        uptime: 99.9, // This would come from actual monitoring
        errorRate: 0.1 // This would come from actual monitoring
      },
      database: {
        status: dbQueryTime < 500 ? 'healthy' : dbQueryTime < 2000 ? 'degraded' : 'down',
        connectionCount,
        queryTime: dbQueryTime,
        size: dbStats.dataSize || 0
      },
      server: serverMetrics,
      payment: paymentStatus
    };
  } catch (error) {
    console.error('Error getting system health:', error);
    
    // Return degraded status if there's an error
    return {
      api: {
        status: 'down',
        responseTime: 0,
        uptime: 0,
        errorRate: 100
      },
      database: {
        status: 'down',
        connectionCount: 0,
        queryTime: 0,
        size: 0
      },
      server: {
        cpu: 0,
        memory: 0,
        disk: 0,
        uptime: 0
      },
      payment: {
        razorpay: 'down',
        payu: 'down',
        successRate: 0
      }
    };
  }
}

async function checkPaymentGatewayStatus(): Promise<{
  razorpay: 'healthy' | 'degraded' | 'down'
  payu: 'healthy' | 'degraded' | 'down'
  successRate: number
}> {
  try {
    // Test Razorpay connection
    const razorpayStatus = await testRazorpayConnection();
    
    // Test PayU connection (placeholder)
    const payuStatus = 'healthy'; // This would be actual PayU test
    
    // Get payment success rate from database
    const { db } = await connectToDatabase();
    const totalPayments = await db.collection('payments').countDocuments();
    const successfulPayments = await db.collection('payments').countDocuments({ status: 'completed' });
    const successRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 100;
    
    return {
      razorpay: razorpayStatus as 'healthy' | 'degraded' | 'down',
      payu: payuStatus as 'healthy' | 'degraded' | 'down',
      successRate: Math.round(successRate * 100) / 100
    };
  } catch (error) {
    console.error('Error checking payment gateway status:', error);
    return {
      razorpay: 'down',
      payu: 'down',
      successRate: 0
    };
  }
}

async function testRazorpayConnection(): Promise<'healthy' | 'degraded' | 'down'> {
  try {
    // Test Razorpay API by fetching a test order
    // In production, you might want to use a health check endpoint
    const testResult = await getPaymentDetails('test_payment_id');
    return testResult.success ? 'healthy' : 'degraded';
  } catch (error) {
    return 'down';
  }
}

async function getServerMetrics() {
  try {
    // In production, you would get these from actual system monitoring
    // For now, we'll simulate some values
    const { db } = await connectToDatabase();
    
    // Get some basic metrics from the database
    const userCount = await db.collection('users').countDocuments();
    const jobCount = await db.collection('jobs').countDocuments();
    
    // Simulate server metrics based on database activity
    const cpu = Math.min(100, Math.max(0, 20 + (userCount / 1000) * 10 + Math.random() * 20));
    const memory = Math.min(100, Math.max(0, 40 + (jobCount / 100) * 5 + Math.random() * 15));
    const disk = Math.min(100, Math.max(0, 30 + Math.random() * 10));
    const uptime = 99.9; // This would come from actual system monitoring
    
    return {
      cpu: Math.round(cpu * 100) / 100,
      memory: Math.round(memory * 100) / 100,
      disk: Math.round(disk * 100) / 100,
      uptime
    };
  } catch (error) {
    console.error('Error getting server metrics:', error);
    return {
      cpu: 0,
      memory: 0,
      disk: 0,
      uptime: 0
    };
  }
}

// Function to log system events
export async function logSystemEvent(
  level: 'INFO' | 'WARN' | 'ERROR',
  service: string,
  message: string,
  metadata?: Record<string, any>
) {
  try {
    const { db } = await connectToDatabase();
    
    await db.collection('system_logs').insertOne({
      timestamp: new Date(),
      level,
      service,
      message,
      metadata: metadata || {},
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error logging system event:', error);
  }
}

// Function to get recent system logs
export async function getSystemLogs(limit: number = 100) {
  try {
    const { db } = await connectToDatabase();
    
    const logs = await db.collection('system_logs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
    
    return logs;
  } catch (error) {
    console.error('Error getting system logs:', error);
    return [];
  }
}

// Function to get system performance metrics
export async function getPerformanceMetrics() {
  try {
    const { db } = await connectToDatabase();
    
    // Get API response times from logs
    const apiLogs = await db.collection('system_logs')
      .find({ service: 'API' })
      .sort({ timestamp: -1 })
      .limit(1000)
      .toArray();
    
    // Calculate average response time
    const responseTimes = apiLogs
      .filter(log => log.metadata?.responseTime)
      .map(log => log.metadata.responseTime);
    
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    
    // Get error rates
    const errorLogs = await db.collection('system_logs')
      .find({ level: 'ERROR' })
      .sort({ timestamp: -1 })
      .limit(1000)
      .toArray();
    
    const errorRate = apiLogs.length > 0 ? (errorLogs.length / apiLogs.length) * 100 : 0;
    
    return {
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      totalRequests: apiLogs.length,
      totalErrors: errorLogs.length
    };
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return {
      avgResponseTime: 0,
      errorRate: 0,
      totalRequests: 0,
      totalErrors: 0
    };
  }
}
