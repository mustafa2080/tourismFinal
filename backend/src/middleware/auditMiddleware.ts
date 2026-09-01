/// <reference types="express" />
import { Request, Response, NextFunction } from 'express';

/**
 * Audit Logging Middleware
 * Logs all sensitive operations for security and compliance
 */

import { AppDataSource } from '../config/connection.js';
import { AdminAuditLog } from '../entities/AdminAuditLog.js';

export interface AuditLogEntry {
  action: string;
  admin_id: string;
  resource_type: string;
  resource_id: string;
  old_values?: any;
  new_values?: any;
  ip_address: string;
  user_agent: string;
  status: 'success' | 'failure';
  details?: string;
}

/**
 * Log audit trail for sensitive operations
 */
export const auditLog = async (entry: AuditLogEntry) => {
  try {
    const auditRepo = AppDataSource.getRepository(AdminAuditLog);
    const log = auditRepo.create({
      admin_id: entry.admin_id,
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      old_values: entry.old_values ? JSON.stringify(entry.old_values) : null,
      new_values: entry.new_values ? JSON.stringify(entry.new_values) : null,
      ip_address: entry.ip_address,
      user_agent: entry.user_agent,
      status: entry.status,
      details: entry.details,
      timestamp: new Date()
    } as any);
    
    await auditRepo.save(log);
    console.log(`📋 [Audit] Logged: ${entry.action} on ${entry.resource_type} by ${entry.admin_id}`);
  } catch (error) {
    console.error('❌ [Audit] Failed to log audit trail:', error);
    // Don't fail the request if audit logging fails
  }
};

/**
 * Middleware to capture request/response for audit logging
 */
export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Capture original send
  const originalSend = res.send;

  res.send = function(data: any) {
    // Call original send
    res.send = originalSend;
    return res.send(data);
  };

  next();
};

/**
 * Log sensitive operations
 * Usage: logAction(req, 'user_deleted', 'user', userId, null, newData)
 */
export const logAction = async (
  req: Request,
  action: string,
  resourceType: string,
  resourceId: string,
  oldValues?: any,
  newValues?: any
) => {
  if (!req.user?.userId) {
    console.warn('⚠️ [Audit] Cannot log action - no user in request');
    return;
  }

  await auditLog({
    action,
    admin_id: req.user.userId,
    resource_type: resourceType,
    resource_id: resourceId,
    old_values: oldValues,
    new_values: newValues,
    ip_address: (req.ip || req.socket.remoteAddress || '').split(',')[0].trim(),
    user_agent: req.get('user-agent') || 'unknown',
    status: 'success',
    details: `${action} on ${resourceType}`
  });
};

/**
 * Audit-worthy operations to log:
 * - User ban/unban
 * - Booking cancellation by admin
 * - Booking status change
 * - Review approval/rejection
 * - Refund issuance
 * - Admin login
 * - Permission changes
 * - System configuration changes
 */

export const AUDITABLE_ACTIONS = {
  USER_BAN: 'user_banned',
  USER_UNBAN: 'user_unbanned',
  USER_DELETED: 'user_deleted',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_STATUS_CHANGED: 'booking_status_changed',
  REVIEW_APPROVED: 'review_approved',
  REVIEW_REJECTED: 'review_rejected',
  REVIEW_DELETED: 'review_deleted',
  REFUND_ISSUED: 'refund_issued',
  ADMIN_LOGIN: 'admin_login',
  CATEGORY_CREATED: 'category_created',
  CATEGORY_UPDATED: 'category_updated',
  CATEGORY_DELETED: 'category_deleted',
  PACKAGE_CREATED: 'package_created',
  PACKAGE_UPDATED: 'package_updated',
  PACKAGE_DELETED: 'package_deleted',
};

export default {
  auditLog,
  auditMiddleware,
  logAction,
  AUDITABLE_ACTIONS
};
