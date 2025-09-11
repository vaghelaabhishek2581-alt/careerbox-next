import { connectToDatabase } from '@/lib/db/mongodb'
import { SystemHealthData } from './types'

export class SystemMonitor {
  private db: any
  private healthCheckInterval: NodeJS.Timeout | null = null

  constructor() {
    this.db = null
  }

  private async getDatabase() {
    if (!this.db) {
      const { db } = await connectToDatabase()
      this.db = db
    }
    return this.db
  }

  /**
   * Get comprehensive system health data
   */
  public async getSystemHealth(): Promise<SystemHealthData> {
    try {
      const db = await this.getDatabase()
      
      // Get system metrics in parallel
      const [
        userCount,
        activeUsers,
        databaseHealth,
        memoryUsage,
        cpuUsage
      ] = await Promise.all([
        this.getTotalUsers(db),
        this.getActiveUsers(db),
        this.checkDatabaseHealth(db),
        this.getMemoryUsage(),
        this.getCpuUsage()
      ])

      // Determine overall health status
      const status = this.determineHealthStatus({
        databaseHealth,
        memoryUsage,
        activeUsers,
        userCount
      })

      return {
        status,
        timestamp: new Date(),
        metrics: {
          totalUsers: userCount,
          activeUsers,
          uptime: process.uptime(),
          memoryUsage,
          cpuUsage
        }
      }
    } catch (error) {
      console.error('Error getting system health:', error)
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        metrics: {
          totalUsers: 0,
          activeUsers: 0,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage()
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get total user count
   */
  private async getTotalUsers(db: any): Promise<number> {
    try {
      return await db.collection('users').countDocuments()
    } catch (error) {
      console.error('Error getting total users:', error)
      return 0
    }
  }

  /**
   * Get active users count (online in last 5 minutes)
   */
  private async getActiveUsers(db: any): Promise<number> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return await db.collection('users').countDocuments({
        status: 'online',
        lastActiveAt: { $gte: fiveMinutesAgo }
      })
    } catch (error) {
      console.error('Error getting active users:', error)
      return 0
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(db: any): Promise<{
    connected: boolean
    responseTime: number
    error?: string
  }> {
    try {
      const startTime = Date.now()
      await db.admin().ping()
      const responseTime = Date.now() - startTime

      return {
        connected: true,
        responseTime
      }
    } catch (error) {
      console.error('Database health check failed:', error)
      return {
        connected: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage()
  }

  /**
   * Get CPU usage
   */
  private getCpuUsage(): NodeJS.CpuUsage {
    return process.cpuUsage()
  }

  /**
   * Determine overall health status
   */
  private determineHealthStatus(metrics: {
    databaseHealth: { connected: boolean; responseTime: number }
    memoryUsage: NodeJS.MemoryUsage
    activeUsers: number
    userCount: number
  }): 'healthy' | 'degraded' | 'unhealthy' {
    const { databaseHealth, memoryUsage, activeUsers, userCount } = metrics

    // Check database health
    if (!databaseHealth.connected || databaseHealth.responseTime > 5000) {
      return 'unhealthy'
    }

    // Check memory usage (if using more than 80% of available memory)
    const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
    if (memoryUsagePercent > 90) {
      return 'unhealthy'
    } else if (memoryUsagePercent > 80) {
      return 'degraded'
    }

    // Check database response time
    if (databaseHealth.responseTime > 2000) {
      return 'degraded'
    }

    return 'healthy'
  }

  /**
   * Start periodic health monitoring
   */
  public startHealthMonitoring(intervalMs: number = 30000): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getSystemHealth()
        this.logHealthStatus(health)
      } catch (error) {
        console.error('Health monitoring error:', error)
      }
    }, intervalMs)

    console.log(`Started health monitoring with ${intervalMs}ms interval`)
  }

  /**
   * Stop health monitoring
   */
  public stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
      console.log('Stopped health monitoring')
    }
  }

  /**
   * Log health status
   */
  private async logHealthStatus(health: SystemHealthData): Promise<void> {
    try {
      const db = await this.getDatabase()
      
      await db.collection('system_health_logs').insertOne({
        ...health,
        loggedAt: new Date()
      })
    } catch (error) {
      console.error('Error logging health status:', error)
    }
  }

  /**
   * Get system performance metrics
   */
  public async getPerformanceMetrics(): Promise<{
    avgResponseTime: number
    errorRate: number
    totalRequests: number
    totalErrors: number
  }> {
    try {
      const db = await this.getDatabase()
      
      // Get API logs from last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      
      const [apiLogs, errorLogs] = await Promise.all([
        db.collection('api_logs').find({
          timestamp: { $gte: oneHourAgo }
        }).toArray(),
        db.collection('api_logs').find({
          timestamp: { $gte: oneHourAgo },
          level: 'ERROR'
        }).toArray()
      ])

      // Calculate average response time
      const responseTimes = apiLogs
        .filter((log: any) => log.responseTime)
        .map((log: any) => log.responseTime)
      
      const avgResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length 
        : 0

      // Calculate error rate
      const errorRate = apiLogs.length > 0 ? (errorLogs.length / apiLogs.length) * 100 : 0

      return {
        avgResponseTime: Math.round(avgResponseTime * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100,
        totalRequests: apiLogs.length,
        totalErrors: errorLogs.length
      }
    } catch (error) {
      console.error('Error getting performance metrics:', error)
      return {
        avgResponseTime: 0,
        errorRate: 0,
        totalRequests: 0,
        totalErrors: 0
      }
    }
  }

  /**
   * Get system alerts
   */
  public async getSystemAlerts(): Promise<Array<{
    type: string
    message: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    timestamp: Date
  }>> {
    try {
      const db = await this.getDatabase()
      
      // Get recent alerts
      const alerts = await db.collection('system_alerts').find({
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).sort({ timestamp: -1 }).limit(50).toArray()

      return alerts.map((alert: any) => ({
        type: alert.type,
        message: alert.message,
        severity: alert.severity,
        timestamp: alert.timestamp
      }))
    } catch (error) {
      console.error('Error getting system alerts:', error)
      return []
    }
  }

  /**
   * Create system alert
   */
  public async createSystemAlert(
    type: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void> {
    try {
      const db = await this.getDatabase()
      
      await db.collection('system_alerts').insertOne({
        type,
        message,
        severity,
        timestamp: new Date(),
        resolved: false
      })

      console.log(`Created system alert: ${type} - ${message}`)
    } catch (error) {
      console.error('Error creating system alert:', error)
      throw error
    }
  }
}
