# Testing the Ballot System

## Prerequisites Check

1. **Active Session Exists**
   ```sql
   SELECT id, name, is_active FROM academic_sessions WHERE is_active = TRUE;
   ```

2. **Hostels & Rooms Are Set Up**
   ```sql
   -- Check hostels
   SELECT id, name, gender, total_capacity, current_occupancy
   FROM hostels
   WHERE is_active = TRUE AND deleted_at IS NULL;

   -- Check rooms
   SELECT r.id, r.room_number, r.capacity, r.current_occupancy, h.name as hostel_name, h.gender
   FROM rooms r
   JOIN hostels h ON h.id = r.hostel_id
   WHERE r.is_available = TRUE AND r.deleted_at IS NULL AND h.deleted_at IS NULL;
   ```

3. **Students with Applications Exist**
   ```sql
   SELECT
     ha.id,
     p.matric_number,
     p.first_name,
     p.last_name,
     p.gender,
     ha.status,
     ha.payment_verified,
     h1.name as first_choice,
     h2.name as second_choice,
     h3.name as third_choice
   FROM hostel_applications ha
   JOIN profiles p ON p.id = ha.student_id
   LEFT JOIN hostels h1 ON h1.id = ha.first_choice_hostel_id
   LEFT JOIN hostels h2 ON h2.id = ha.second_choice_hostel_id
   LEFT JOIN hostels h3 ON h3.id = ha.third_choice_hostel_id
   WHERE ha.session_id = (SELECT id FROM academic_sessions WHERE is_active = TRUE LIMIT 1)
   ORDER BY ha.created_at DESC;
   ```

## Common Issues

### Issue 1: No Students Ready for Ballot
**Symptom:** "0 WAITING" shown on ballot page

**Solution:** Verify payments for student applications
```sql
-- Find applications that need verification
SELECT ha.id, p.matric_number, p.first_name, p.last_name, ha.status, ha.payment_verified
FROM hostel_applications ha
JOIN profiles p ON p.id = ha.student_id
WHERE ha.session_id = (SELECT id FROM academic_sessions WHERE is_active = TRUE LIMIT 1)
AND (ha.payment_verified = FALSE OR ha.status != 'payment_verified');

-- Manually verify a payment (replace APPLICATION_ID)
UPDATE hostel_applications
SET
  payment_verified = TRUE,
  status = 'payment_verified',
  payment_verified_at = NOW()
WHERE id = 'APPLICATION_ID';
```

### Issue 2: No Rooms Available
**Symptom:** Ballot runs but students marked as "not_allocated"

**Solution:** Add rooms to hostels
```sql
-- Check available capacity
SELECT
  h.name,
  h.gender,
  h.total_capacity,
  h.current_occupancy,
  (h.total_capacity - h.current_occupancy) as available_spaces,
  COUNT(r.id) as room_count,
  COALESCE(SUM(r.capacity - r.current_occupancy), 0) as available_beds
FROM hostels h
LEFT JOIN rooms r ON r.hostel_id = h.id AND r.deleted_at IS NULL
WHERE h.deleted_at IS NULL
GROUP BY h.id, h.name, h.gender, h.total_capacity, h.current_occupancy;
```

### Issue 3: Gender Mismatch
**Symptom:** Students not allocated even though rooms exist

**Solution:** Ensure student gender matches hostel gender
```sql
SELECT
  p.matric_number,
  p.gender as student_gender,
  h1.name as first_choice,
  h1.gender as first_choice_gender,
  CASE WHEN p.gender = h1.gender THEN '✓' ELSE '✗ MISMATCH' END as match
FROM hostel_applications ha
JOIN profiles p ON p.id = ha.student_id
JOIN hostels h1 ON h1.id = ha.first_choice_hostel_id
WHERE ha.payment_verified = TRUE
AND ha.status = 'payment_verified';
```

## Test Scenario: Complete Ballot Flow

### Step 1: Create Test Rooms (if needed)
```sql
-- Get hostel IDs
SELECT id, name, gender FROM hostels WHERE deleted_at IS NULL;

-- Add 5 rooms to each hostel (replace HOSTEL_ID)
INSERT INTO rooms (hostel_id, room_number, floor_number, capacity, room_type, is_available)
SELECT
  'HOSTEL_ID',
  'R' || LPAD(generate_series::text, 3, '0'),
  (generate_series - 1) / 10 + 1,
  4,
  'shared',
  TRUE
FROM generate_series(1, 5);
```

### Step 2: Verify Student Applications
```sql
-- Get active session ID
SELECT id, name FROM academic_sessions WHERE is_active = TRUE;

-- Verify all pending applications for testing
UPDATE hostel_applications
SET
  payment_verified = TRUE,
  status = 'payment_verified',
  payment_verified_at = NOW()
WHERE session_id = (SELECT id FROM academic_sessions WHERE is_active = TRUE LIMIT 1)
AND payment_verified = FALSE;
```

### Step 3: Run Ballot
- Go to Admin Dashboard → Ballot System
- Click "RUN BALLOT NOW"
- System will allocate students to their preferences

### Step 4: Verify Results
```sql
-- Check allocations
SELECT
  p.matric_number,
  p.first_name,
  p.last_name,
  h.name as allocated_hostel,
  r.room_number,
  a.bed_space_number,
  a.status
FROM allocations a
JOIN profiles p ON p.id = a.student_id
JOIN hostels h ON h.id = a.hostel_id
JOIN rooms r ON r.id = a.room_id
WHERE a.session_id = (SELECT id FROM academic_sessions WHERE is_active = TRUE LIMIT 1)
ORDER BY h.name, r.room_number, a.bed_space_number;

-- Check if students got their preferred hostels
SELECT
  p.matric_number,
  p.first_name,
  CASE
    WHEN a.hostel_id = ha.first_choice_hostel_id THEN '1st Choice ✓'
    WHEN a.hostel_id = ha.second_choice_hostel_id THEN '2nd Choice'
    WHEN a.hostel_id = ha.third_choice_hostel_id THEN '3rd Choice'
    ELSE 'Other'
  END as choice_received,
  h.name as allocated_hostel
FROM allocations a
JOIN hostel_applications ha ON ha.student_id = a.student_id AND ha.session_id = a.session_id
JOIN profiles p ON p.id = a.student_id
JOIN hostels h ON h.id = a.hostel_id
WHERE a.session_id = (SELECT id FROM academic_sessions WHERE is_active = TRUE LIMIT 1);
```

## How the Priority Algorithm Works

1. **Calculate Priority Score** (weighted formula):
   - Payment timing: 50%
   - Student category (level): 30%
   - Other factors: 20%

2. **Sort students** by priority score (highest first)

3. **For each student** (in priority order):
   - Try to find available room in **1st choice hostel**
   - If full → try **2nd choice hostel**
   - If full → try **3rd choice hostel**
   - If all full → mark as "not_allocated"

4. **Room selection criteria**:
   - Must match student gender
   - Must have available capacity
   - Rooms filled evenly (lowest occupancy first)
   - Row-level locking prevents race conditions

## Expected Behavior Examples

### Example 1: First Choice Available
- Student picks: Akata (1st), Hollywood (2nd), PGD (3rd)
- Akata has space → **Allocated to Akata ✓**

### Example 2: First Choice Full
- Student picks: Akata (1st), Hollywood (2nd), PGD (3rd)
- Akata is full → Hollywood has space → **Allocated to Hollywood ✓**

### Example 3: All Choices Full
- Student picks: Akata (1st), Hollywood (2nd), PGD (3rd)
- All three are full → **Marked as "not_allocated"**
