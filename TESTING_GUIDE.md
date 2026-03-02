# Analytics Dashboard Testing Guide

## Prerequisites

1. Backend server running on configured port
2. Frontend development server running
3. Database with test data (artists, bookings, wishlist entries)
4. Valid artist account credentials

## Test Scenarios

### 1. Initial Dashboard Load

**Steps**:
1. Log in as an artist
2. Navigate to artist dashboard
3. Observe analytics cards section

**Expected Results**:
- All 5 cards display correctly
- Numbers load from database
- Default filter is "daily"
- Cards show proper colors and icons
- Hover effects work on all cards

**Verify**:
- [ ] Profile Views shows total views
- [ ] Total Bookings shows total count
- [ ] Pending Requests shows current pending count
- [ ] Upcoming Events shows future accepted bookings
- [ ] Wishlist Count shows total wishlist adds

---

### 2. Filter Switching

**Steps**:
1. Click "Weekly" filter
2. Observe card updates
3. Click "Monthly" filter
4. Observe card updates
5. Click "Daily" filter
6. Observe card updates

**Expected Results**:
- Filter button highlights correctly
- Total Bookings badge updates with filtered count
- Subtitle text changes ("X today", "X this week", "X this month")
- Other cards remain unchanged (they don't filter)
- No loading delays or flickering

**Verify**:
- [ ] Active filter has gradient background
- [ ] Inactive filters have gray text
- [ ] Bookings filtered count is accurate
- [ ] API calls complete successfully
- [ ] No console errors

---

### 3. Zero State Testing

**Steps**:
1. Test with artist account that has:
   - 0 profile views
   - 0 bookings
   - 0 pending requests
   - 0 upcoming events
   - 0 wishlist adds

**Expected Results**:
- All cards display "0"
- No errors or crashes
- Layout remains intact
- Badges hide when count is 0 (for Pending/Upcoming)

**Verify**:
- [ ] Cards display "0" gracefully
- [ ] No "undefined" or "NaN" values
- [ ] UI remains visually appealing
- [ ] No JavaScript errors

---

### 4. High Volume Testing

**Steps**:
1. Test with artist account that has:
   - 10,000+ profile views
   - 500+ bookings
   - 20+ pending requests
   - 30+ upcoming events
   - 200+ wishlist adds

**Expected Results**:
- Numbers display with proper formatting (commas)
- Cards don't overflow or break layout
- Performance remains smooth
- All data loads correctly

**Verify**:
- [ ] Numbers formatted as "10,000" not "10000"
- [ ] Large numbers don't break card layout
- [ ] API response time acceptable (<2s)
- [ ] No UI glitches

---

### 5. Real-Time Updates

**Steps**:
1. Note current pending requests count
2. Accept or reject a booking request
3. Observe analytics cards

**Expected Results**:
- Pending Requests count decreases
- Total Bookings count updates (if accepted)
- Upcoming Events count updates (if accepted and future date)
- Cards refresh without page reload

**Verify**:
- [ ] Pending count decreases by 1
- [ ] Bookings count increases by 1 (if accepted)
- [ ] Upcoming count increases by 1 (if accepted + future)
- [ ] Update happens automatically
- [ ] No manual refresh needed

---

### 6. Responsive Design Testing

**Desktop (1920x1080)**:
- [ ] 5 cards in single row
- [ ] Proper spacing between cards
- [ ] Hover effects work smoothly
- [ ] Text is readable

**Tablet (768x1024)**:
- [ ] Cards stack in 2 columns
- [ ] Layout remains balanced
- [ ] Touch interactions work
- [ ] No horizontal scroll

**Mobile (375x667)**:
- [ ] Cards stack vertically
- [ ] Full width cards
- [ ] Touch targets adequate size
- [ ] Text remains readable
- [ ] No content cutoff

---

### 7. Filter Accuracy Testing

**Daily Filter**:
1. Create booking today
2. Refresh dashboard
3. Select "Daily" filter
4. Verify filtered bookings shows 1

**Weekly Filter**:
1. Create bookings on different days this week
2. Select "Weekly" filter
3. Verify count matches bookings from last 7 days

**Monthly Filter**:
1. Create bookings throughout the month
2. Select "Monthly" filter
3. Verify count matches bookings from last 30 days

**Verify**:
- [ ] Daily filter shows today's bookings only
- [ ] Weekly filter shows last 7 days
- [ ] Monthly filter shows last 30 days
- [ ] Date calculations are accurate

---

### 8. Authentication & Authorization

**Steps**:
1. Log in as Artist A
2. Note analytics data
3. Log out
4. Log in as Artist B
5. Verify different data displays

**Expected Results**:
- Each artist sees only their own data
- No data leakage between accounts
- Proper token validation
- Secure API calls

**Verify**:
- [ ] Artist A sees their data only
- [ ] Artist B sees their data only
- [ ] No unauthorized access
- [ ] Token properly validated

---

### 9. Error Handling

**Network Error**:
1. Disconnect internet
2. Refresh dashboard
3. Observe behavior

**Expected**: Error toast, graceful degradation

**API Error**:
1. Stop backend server
2. Refresh dashboard
3. Observe behavior

**Expected**: Loading state, then error message

**Invalid Token**:
1. Manually corrupt localStorage token
2. Refresh dashboard
3. Observe behavior

**Expected**: Redirect to login

**Verify**:
- [ ] Network errors handled gracefully
- [ ] API errors show user-friendly messages
- [ ] Invalid tokens redirect to login
- [ ] No app crashes

---

### 10. Performance Testing

**Metrics to Check**:
- Initial load time: < 2 seconds
- Filter switch time: < 500ms
- API response time: < 1 second
- Smooth animations: 60fps
- Memory usage: stable (no leaks)

**Tools**:
- Chrome DevTools Performance tab
- Network tab for API timing
- React DevTools for re-renders

**Verify**:
- [ ] Fast initial load
- [ ] Smooth filter transitions
- [ ] No unnecessary re-renders
- [ ] Efficient API calls
- [ ] No memory leaks

---

## Database Verification Queries

### Check Profile Views
```sql
SELECT views FROM artists WHERE id = [artist_id];
```

### Check Total Bookings
```sql
SELECT COUNT(*) FROM bookings WHERE artist_id = [artist_id];
```

### Check Pending Requests
```sql
SELECT COUNT(*) FROM bookings 
WHERE artist_id = [artist_id] AND status = 'pending';
```

### Check Upcoming Events
```sql
SELECT COUNT(*) FROM bookings 
WHERE artist_id = [artist_id] 
AND status = 'accepted' 
AND event_date >= CURRENT_DATE;
```

### Check Wishlist Count
```sql
SELECT COUNT(*) FROM wishlist WHERE artist_id = [artist_id];
```

### Check Filtered Bookings (Weekly)
```sql
SELECT COUNT(*) FROM bookings 
WHERE artist_id = [artist_id] 
AND created_at >= NOW() - INTERVAL '7 days';
```

---

## Common Issues & Solutions

### Issue: Cards show "0" despite having data
**Solution**: Check API endpoint authentication, verify artist ID matches

### Issue: Filter doesn't update numbers
**Solution**: Check network tab for API calls, verify filter parameter sent correctly

### Issue: Numbers not formatted with commas
**Solution**: Verify `.toLocaleString()` is applied to all numeric displays

### Issue: Hover effects not working
**Solution**: Check CSS classes, verify Tailwind compilation

### Issue: Cards overflow on mobile
**Solution**: Check responsive grid classes, verify breakpoints

### Issue: Pending badge always shows
**Solution**: Check conditional rendering logic `{stats.pendingRequests > 0 && ...}`

---

## Automated Testing Checklist

### Unit Tests
- [ ] Analytics API endpoint returns correct data
- [ ] Filter calculations are accurate
- [ ] Date range logic works correctly
- [ ] Number formatting functions work

### Integration Tests
- [ ] Dashboard loads with correct data
- [ ] Filter switching updates correctly
- [ ] Booking actions trigger updates
- [ ] Authentication works properly

### E2E Tests
- [ ] Complete user flow from login to dashboard
- [ ] Filter interaction and data updates
- [ ] Responsive behavior on different devices
- [ ] Error scenarios handled correctly

---

## Sign-Off Checklist

Before marking as complete, verify:

- [ ] All 5 cards display correctly
- [ ] Filters work (daily, weekly, monthly)
- [ ] Real-time updates after booking actions
- [ ] Responsive on all screen sizes
- [ ] No console errors or warnings
- [ ] Performance is acceptable
- [ ] Data is accurate and secure
- [ ] Error handling works
- [ ] Accessibility standards met
- [ ] Code is clean and documented

---

## Reporting Issues

When reporting bugs, include:
1. Artist ID being tested
2. Current filter selection
3. Expected vs actual values
4. Browser and device info
5. Console errors (if any)
6. Network tab screenshot
7. Steps to reproduce

---

## Success Criteria

✅ All cards display accurate real-time data
✅ Filters work correctly for applicable metrics
✅ UI is responsive and visually appealing
✅ Performance is smooth and fast
✅ No errors in console
✅ Data updates automatically after actions
✅ Secure and properly authenticated
✅ Accessible to all users
