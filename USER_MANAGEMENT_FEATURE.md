# User Management System - Complete Implementation Guide

## Overview
Complete user account management system with Active/Inactive/Suspended/Terminated status, notifications, and blocking messages.

## Features

### 1. Account Status Types
- **Active**: Normal account, full access
- **Inactive**: Temporarily disabled by admin, can be reactivated
- **Suspended**: Time-bound restriction (1 hour, 5 hours, 1 day, etc.)
- **Terminated**: Permanently banned, requires admin approval to restore

### 2. Admin Actions
- Activate/Deactivate user accounts
- Suspend with duration (1 hour, 5 hours, 1 day, custom)
- Terminate accounts
- Add reason for action
- View suspension history

### 3. User Experience
- **When Inactive**: Cannot login, see message with reason
- **When Suspended**: Cannot login, see countdown timer, reason, and duration
- **When Terminated**: Cannot login, see termination message with support contact
- **When Reactivated**: Receive notification, full access restored

### 4. Notifications
- Real-time notifications for status changes
- Toast notifications on dashboard
- Email notifications (optional)
- Notification history

## Database Schema

```sql
-- Users table additions
ALTER TABLE users ADD COLUMN account_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN suspension_reason TEXT;
ALTER TABLE users ADD COLUMN suspension_start TIMESTAMP;
ALTER TABLE users ADD COLUMN suspension_end TIMESTAMP;
ALTER TABLE users ADD COLUMN suspended_by VARCHAR(255);
ALTER TABLE users ADD COLUMN last_status_change TIMESTAMP;

-- Artists table additions (same fields)
ALTER TABLE artists ADD COLUMN account_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE artists ADD COLUMN suspension_reason TEXT;
ALTER TABLE artists ADD COLUMN suspension_start TIMESTAMP;
ALTER TABLE artists ADD COLUMN suspension_end TIMESTAMP;
ALTER TABLE artists ADD COLUMN suspended_by VARCHAR(255);
ALTER TABLE artists ADD COLUMN last_status_change TIMESTAMP;

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  user_type VARCHAR(20), -- 'user' or 'artist'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50), -- 'info', 'warning', 'success', 'error', 'account_status'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

## Backend API Endpoints

### Admin Routes (`/api/admin/users`)

```javascript
// Get all users with status
GET /api/admin/users
Response: [{ id, name, email, account_status, suspension_end, ... }]

// Update user status
PATCH /api/admin/users/:id/status
Body: {
  status: 'active' | 'inactive' | 'suspended' | 'terminated',
  reason: 'Violation of terms',
  duration: 3600, // seconds (for suspended)
  adminName: 'Admin Name'
}

// Get user suspension history
GET /api/admin/users/:id/history

// Terminate user
POST /api/admin/users/:id/terminate
Body: { reason: 'Serious violation' }

// Reactivate terminated user
POST /api/admin/users/:id/reactivate
```

### User Routes (`/api/users`)

```javascript
// Check account status
GET /api/users/me/status
Response: {
  account_status: 'active',
  suspension_end: null,
  suspension_reason: null
}

// Get notifications
GET /api/users/me/notifications
Response: [{ id, title, message, type, is_read, created_at }]

// Mark notification as read
PATCH /api/users/me/notifications/:id/read
```

## Frontend Components

### 1. Admin Panel - User Management Tab

```jsx
// admin-panel/src/pages/UserManagement.jsx
<div className="user-management">
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {users.map(user => (
        <tr key={user.id}>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>
            <StatusBadge status={user.account_status} />
          </td>
          <td>
            <button onClick={() => handleInactivate(user.id)}>
              Deactivate
            </button>
            <button onClick={() => handleSuspend(user.id)}>
              Suspend
            </button>
            <button onClick={() => handleTerminate(user.id)}>
              Terminate
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### 2. Suspension Modal

```jsx
// admin-panel/src/components/SuspensionModal.jsx
<Modal>
  <h3>Suspend User Account</h3>
  <select value={duration} onChange={e => setDuration(e.target.value)}>
    <option value="3600">1 Hour</option>
    <option value="18000">5 Hours</option>
    <option value="86400">1 Day</option>
    <option value="259200">3 Days</option>
    <option value="604800">1 Week</option>
    <option value="custom">Custom</option>
  </select>
  
  <textarea 
    placeholder="Reason for suspension"
    value={reason}
    onChange={e => setReason(e.target.value)}
  />
  
  <button onClick={handleSubmit}>Suspend Account</button>
</Modal>
```

### 3. Account Blocked Screen

```jsx
// frontend/src/components/AccountBlocked.jsx
export default function AccountBlocked({ status, reason, suspensionEnd }) {
  if (status === 'inactive') {
    return (
      <div className="blocked-screen">
        <h1>⚠️ Account Temporarily Inactive</h1>
        <p>Your account has been temporarily deactivated by our admin team.</p>
        <div className="reason-box">
          <strong>Reason:</strong>
          <p>{reason || 'Policy violation'}</p>
        </div>
        <p>If you believe this is a mistake, please contact support.</p>
        <a href="mailto:support@spotmystar.com">Contact Support</a>
      </div>
    );
  }
  
  if (status === 'suspended') {
    return (
      <div className="blocked-screen">
        <h1>⏸️ Account Suspended</h1>
        <p>Your account has been temporarily suspended.</p>
        <div className="countdown">
          <CountdownTimer endTime={suspensionEnd} />
        </div>
        <div className="reason-box">
          <strong>Reason:</strong>
          <p>{reason}</p>
        </div>
        <p>Your account will be automatically reactivated after the suspension period.</p>
      </div>
    );
  }
  
  if (status === 'terminated') {
    return (
      <div className="blocked-screen">
        <h1>🚫 Account Terminated</h1>
        <p>Your account has been permanently terminated due to serious policy violations.</p>
        <div className="reason-box">
          <strong>Reason:</strong>
          <p>{reason}</p>
        </div>
        <div className="support-box">
          <h3>Want to appeal?</h3>
          <p>If you believe this action was taken in error, please contact our support team.</p>
          <p>We will review your case within 24 hours.</p>
          <div className="contact-options">
            <a href="mailto:support@spotmystar.com" className="btn">
              📧 Email Support
            </a>
            <a href="https://wa.me/1234567890" className="btn">
              💬 WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    );
  }
}
```

### 4. Notification System

```jsx
// frontend/src/components/NotificationBell.jsx
export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchNotifications = async () => {
    const { data } = await api.get('/api/users/me/notifications');
    setNotifications(data);
    setUnreadCount(data.filter(n => !n.is_read).length);
  };
  
  return (
    <div className="notification-bell">
      <button onClick={() => setShowDropdown(!showDropdown)}>
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>
      
      {showDropdown && (
        <div className="notifications-dropdown">
          {notifications.map(notif => (
            <div key={notif.id} className={`notification ${notif.is_read ? 'read' : 'unread'}`}>
              <h4>{notif.title}</h4>
              <p>{notif.message}</p>
              <span className="time">{formatTime(notif.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 5. Login Check Middleware

```jsx
// frontend/src/utils/authCheck.js
export async function checkAccountStatus() {
  try {
    const { data } = await api.get('/api/users/me/status');
    
    if (data.account_status !== 'active') {
      // Redirect to blocked screen
      return {
        blocked: true,
        status: data.account_status,
        reason: data.suspension_reason,
        suspensionEnd: data.suspension_end
      };
    }
    
    return { blocked: false };
  } catch (error) {
    return { blocked: false };
  }
}

// Use in App.jsx or protected routes
useEffect(() => {
  const checkStatus = async () => {
    const result = await checkAccountStatus();
    if (result.blocked) {
      navigate('/account-blocked', { state: result });
    }
  };
  
  checkStatus();
  const interval = setInterval(checkStatus, 60000); // Check every minute
  return () => clearInterval(interval);
}, []);
```

## Notification Messages

### Inactive
```
Title: Account Temporarily Deactivated
Message: Your account has been temporarily deactivated by our admin team due to: [REASON]. Please contact support if you believe this is a mistake.
```

### Suspended
```
Title: Account Suspended
Message: Your account has been suspended for [DURATION] due to: [REASON]. Your account will be automatically reactivated on [DATE TIME].
```

### Terminated
```
Title: Account Terminated
Message: Your account has been permanently terminated due to: [REASON]. If you wish to appeal this decision, please contact our support team at support@spotmystar.com within 24 hours.
```

### Reactivated from Inactive
```
Title: Account Reactivated ✅
Message: Good news! Your account has been reactivated on [DATE TIME]. You can now use all features of SpotMyStar. Please ensure you follow our community guidelines.
```

### Reactivated from Suspended
```
Title: Suspension Lifted ✅
Message: Your account suspension has been lifted. You now have full access to SpotMyStar. Please avoid any actions that violate our terms of service.
```

### Reactivated from Terminated
```
Title: Account Restored ✅
Message: Your account has been restored on [DATE TIME]. We're giving you another chance. Please strictly follow our community guidelines to avoid future issues. Thank you for your cooperation.
```

## Implementation Steps

1. **Database Setup**
   - Run `add-user-management.sql`
   - Verify tables and columns created

2. **Backend API**
   - Create `/api/admin/users` routes
   - Create `/api/users/me/status` route
   - Create `/api/users/me/notifications` routes
   - Add notification creation logic

3. **Admin Panel**
   - Add "User Management" tab
   - Create suspension modal
   - Add action buttons (Deactivate, Suspend, Terminate)
   - Add duration selector
   - Add reason input

4. **Frontend**
   - Create AccountBlocked component
   - Create NotificationBell component
   - Add status check middleware
   - Create blocked screen route
   - Add countdown timer component

5. **Testing**
   - Test each status type
   - Test notifications
   - Test auto-reactivation after suspension
   - Test terminated account appeal flow

## Auto-Reactivation Logic

```javascript
// Backend cron job or scheduled task
async function checkExpiredSuspensions() {
  const now = new Date();
  
  // Find all suspended accounts where suspension_end has passed
  const expiredSuspensions = await pool.query(`
    SELECT id, email, user_type FROM (
      SELECT id, email, 'user' as user_type FROM users 
      WHERE account_status = 'suspended' AND suspension_end <= $1
      UNION
      SELECT id, email, 'artist' as user_type FROM artists 
      WHERE account_status = 'suspended' AND suspension_end <= $1
    ) AS expired
  `, [now]);
  
  for (const account of expiredSuspensions.rows) {
    // Reactivate account
    if (account.user_type === 'user') {
      await pool.query(`
        UPDATE users 
        SET account_status = 'active', 
            last_status_change = NOW()
        WHERE id = $1
      `, [account.id]);
    } else {
      await pool.query(`
        UPDATE artists 
        SET account_status = 'active', 
            last_status_change = NOW()
        WHERE id = $1
      `, [account.id]);
    }
    
    // Send reactivation notification
    await pool.query(`
      INSERT INTO notifications (user_id, user_type, title, message, type)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      account.id,
      account.user_type,
      'Suspension Lifted ✅',
      'Your account suspension has been lifted. You now have full access to SpotMyStar.',
      'account_status'
    ]);
  }
}

// Run every 5 minutes
setInterval(checkExpiredSuspensions, 5 * 60 * 1000);
```

## Support Contact Information

```javascript
const SUPPORT_CONTACTS = {
  email: 'support@spotmystar.com',
  whatsapp: '+91-XXXXXXXXXX',
  responseTime: '24 hours'
};
```

---

**Note**: This is a comprehensive feature that requires careful implementation. Test thoroughly before deploying to production.
