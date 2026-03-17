# Order Tracking System - Real-World Business Logic

## Overview
This document outlines the order tracking system implemented with real-world business logic, state machine validation, and proper workflow enforcement.

## Order State Machine

The order tracking system follows a strict state machine pattern where orders can only move forward through defined stages:

```
┌─────────┐     ┌───────────┐     ┌────────────┐     ┌─────────┐
│ Pending ├────>│ Confirmed ├────>│ Processing ├────>│ Shipped │
└────┬────┘     └─────┬─────┘     └────────────┘     └────┬────┘
     │                │                                     │
     │                │                                     ▼
     │                │                              ┌──────────────────┐
     │                │                              │ Out for Delivery │
     │                │                              └────────┬─────────┘
     │                │                                       │
     │                │                                       ▼
     │                │                                ┌───────────┐
     │                │                                │ Delivered │
     │                │                                └─────┬─────┘
     │                │                                      │
     ▼                ▼                                      ▼
┌───────────┐                                         ┌──────────┐
│ Cancelled │ (Terminal State)                        │ Returned │ (Terminal State)
└───────────┘                                         └──────────┘
```

## Valid State Transitions

### Forward-Only Workflow
Orders can only move forward through the workflow. Admin cannot move orders backward.

| Current Status | Valid Next Statuses |
|---|---|
| **pending** | confirmed, cancelled |
| **confirmed** | processing, cancelled |
| **processing** | shipped |
| **shipped** | out_for_delivery |
| **out_for_delivery** | delivered |
| **delivered** | returned |
| **cancelled** | (none - terminal state) |
| **returned** | (none - terminal state) |

### Customer Actions

#### Cancel Order
- **Allowed States**: `pending`, `confirmed`
- **Restriction**: Can only cancel **before** processing starts
- **Business Logic**: Once order enters processing/fulfillment, customer cannot cancel
- **Optional**: Cancellation reason

#### Return Order
- **Allowed State**: `delivered` only
- **Restriction**: Can only return **after** delivery
- **Business Logic**: Must receive product before requesting return
- **Optional**: Return reason

### Admin Actions

#### Update Order Status
- **Allowed**: Can only move to valid next statuses (forward only)
- **Prevented**: 
  - Moving backward (e.g., shipped → processing)
  - Skipping stages (e.g., pending → shipped)
  - Modifying cancelled or returned orders
- **Terminal States**: Orders in `cancelled` or `returned` status cannot be modified

## Implementation Details

### Backend Model (`Order.js`)

#### Schema Fields
```javascript
{
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 
           'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  cancellationReason: String,  // Optional reason for cancellation
  returnReason: String          // Optional reason for return
}
```

#### Instance Methods

**`canBeCancelledByCustomer()`**
- Returns `true` if status is `pending` or `confirmed`
- Used to validate customer cancellation requests

**`canBeReturnedByCustomer()`**
- Returns `true` if status is `delivered`
- Used to validate customer return requests

**`canTransitionTo(newStatus)`**
- Validates if transition from current status to new status is allowed
- Returns `true` if valid, `false` otherwise

**`isTerminalState()`**
- Returns `true` if order is in `cancelled` or `returned` status
- Terminal states cannot be modified

**`getValidNextStatuses()`**
- Returns array of valid next statuses for current state
- Used to populate admin dropdown dynamically

### Backend Routes (`orders.js`)

#### Customer Endpoints

**PUT `/api/orders/:id/cancel`**
- Protected route (customer must own order)
- Validates customer can cancel (pending or confirmed only)
- Checks if order is already in terminal state
- Stores optional cancellation reason
- Emits real-time update

**PUT `/api/orders/:id/return`**
- Protected route (customer must own order)
- Validates customer can return (delivered only)
- Checks if order is already in terminal state
- Stores optional return reason
- Emits real-time update

#### Admin Endpoints

**PUT `/api/orders/:id/status`**
- Protected route (admin only)
- Validates transition is allowed by state machine
- Prevents modification of terminal state orders
- Returns detailed error messages with valid transitions
- Emits real-time update

**GET `/api/orders/:id/valid-transitions`**
- Protected route (admin only)
- Returns current status and valid next statuses
- Used by frontend to dynamically show valid options

### Frontend Implementation

#### Admin Dashboard

**Dynamic Status Dropdown**
- Shows current status as disabled option
- Only displays valid next statuses based on state machine
- Disabled for terminal states (shows badge instead)
- Clear error messages when invalid transition attempted

**Visual Indicators**
- Terminal states shown as badges (not dropdowns)
- Cancellation/return reasons displayed when present
- Color coding: Red for cancelled, Gray for returned

#### Customer Dashboard

**Smart Action Buttons**
- Cancel button: Only visible for `pending` or `confirmed` orders
- Return button: Only visible for `delivered` orders
- No buttons shown for terminal states or in-progress orders

**User-Friendly Messages**
- Clear explanations in confirmation dialogs
- Helpful error messages when actions not allowed
- Optional reason prompts for cancellations and returns

## Error Handling

### Invalid Transition Error Response
```json
{
  "message": "Invalid status transition from 'processing' to 'pending'. Orders can only move forward in the workflow.",
  "currentStatus": "processing",
  "validNextStatuses": ["shipped"],
  "error": "INVALID_TRANSITION"
}
```

### Terminal State Error Response
```json
{
  "message": "Cannot modify order. Order is cancelled. Terminal state orders cannot be changed.",
  "currentStatus": "cancelled",
  "reason": "Customer requested cancellation"
}
```

### Customer Action Error Response
```json
{
  "message": "Cannot cancel order with status: processing. Orders can only be cancelled while pending or confirmed (before processing starts)."
}
```

## Real-World Benefits

### 1. **Business Logic Enforcement**
- Prevents accidental or malicious order manipulation
- Ensures orders follow proper fulfillment workflow
- Protects against moving orders backward

### 2. **Customer Protection**
- Clear cancellation window (before processing)
- Prevents cancellation of already-prepared orders
- Allows returns only after receiving product

### 3. **Operational Integrity**
- Terminal states prevent further modifications
- Audit trail with cancellation/return reasons
- Real-time updates keep all parties informed

### 4. **Error Prevention**
- State machine validation at model level
- Clear error messages guide proper usage
- Frontend dynamically shows valid options only

### 5. **Scalability**
- Easy to add new statuses to state machine
- Consistent validation across all endpoints
- Centralized business logic in model

## Testing Scenarios

### ✅ Valid Scenarios
1. Customer cancels pending order → Success
2. Customer cancels confirmed order → Success
3. Admin moves pending → confirmed → processing → shipped → out_for_delivery → delivered
4. Customer returns delivered order → Success
5. Admin attempts to move processing order, only sees "shipped" option

### ❌ Invalid Scenarios (Properly Blocked)
1. Customer tries to cancel processing order → Error: "Can only cancel pending/confirmed"
2. Customer tries to return confirmed order → Error: "Can only return delivered orders"
3. Admin tries to move order backward (shipped → processing) → Error: "Invalid transition"
4. Admin tries to modify cancelled order → Error: "Terminal state cannot be changed"
5. Admin tries to skip stages (pending → shipped) → Error: "Invalid transition"
6. Customer tries to cancel already cancelled order → Error: "Already cancelled"

## Migration Notes

If migrating from old system:
1. All existing orders retain their current status
2. State machine validation applies to all future transitions
3. No data migration required for order statuses
4. Optional: Add cancellationReason and returnReason fields (backward compatible)

## Future Enhancements

Potential additions to enhance the system:
- **Time-based rules**: Auto-cancel if pending for 24 hours
- **Return window**: Only allow returns within 7 days of delivery
- **Partial returns**: Support returning individual items
- **Refund tracking**: Add refund status and amount
- **Admin override**: Special permission to bypass state machine (with audit log)
- **Email notifications**: Send emails on status changes
- **SMS alerts**: Notify customers via SMS for key transitions
- **Shipment tracking**: Integrate with courier APIs

## Support

For questions or issues related to the order tracking system, refer to:
- Order model: `backend/src/models/Order.js`
- Order routes: `backend/src/routes/orders.js`
- Admin UI: `src/pages/AdminDashboard.tsx`
- Customer UI: `src/pages/CustomerDashboard.tsx`
