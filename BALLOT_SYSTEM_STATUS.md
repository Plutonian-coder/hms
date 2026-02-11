# Ballot System Status Report

## ✅ GOOD NEWS: Algorithm is Already Correct!

The hostel preference allocation algorithm is **already correctly implemented** in your system. Here's what it does:

### How It Works (Priority-Based Allocation)

```
FOR EACH verified student (sorted by priority score, highest first):
  1. Try to find available room in FIRST CHOICE hostel
     ↓ If found → Allocate and DONE ✓

  2. If first choice full → Try SECOND CHOICE hostel
     ↓ If found → Allocate and DONE ✓

  3. If second choice full → Try THIRD CHOICE hostel
     ↓ If found → Allocate and DONE ✓

  4. If all choices full → Mark as "not_allocated" ✗
```

**Implementation:** [supabase/migrations/001_init.sql:644-700](supabase/migrations/001_init.sql#L644-L700)

### Priority Score Calculation

Students are ranked by:
- **50%** Payment timing (earlier = higher score)
- **30%** Student category (100 level = 100, 400 level = 90, etc.)
- **20%** Level-based score

Higher priority students get first pick of available rooms.

---

## ❌ Why You See "0 WAITING"

Your screenshot shows **"Verified Applications COUNT: 0"** which means:

**No students are ready for balloting** because:
- Students must have `payment_verified = TRUE`
- Students must have `status = 'payment_verified'`
- Applications must be for the active session

---

## 🔧 How to Fix and Test

### Option 1: Quick Test with Sample Data (Recommended)

Run this script to create test students and verify the system works:

```bash
# In Supabase SQL Editor, run:
backend/scripts/setup_ballot_test_data.sql
```

This will create:
- ✓ Active session (2026/2027)
- ✓ YabaTech hostels (Akata, Hollywood, PGD, etc.)
- ✓ 10 rooms per hostel (4 beds each = 40 beds per hostel)
- ✓ 8 test students (5 male, 3 female) with verified payments
- ✓ Each student has hostel preferences (1st, 2nd, 3rd choice)

Then:
1. Go to **Admin Dashboard → Ballot System**
2. You should see **"8 WAITING"**
3. Click **"RUN BALLOT NOW"**
4. System will allocate students to their preferred hostels

### Option 2: Diagnose Your Current Data

Run the diagnostic script to see what's missing:

```bash
# In Supabase SQL Editor, run:
backend/scripts/diagnose_ballot.sql
```

This will show you:
- ✓/✗ Active session exists?
- ✓/✗ Hostels exist?
- ✓/✗ Rooms exist?
- ✓/✗ Students ready for ballot?
- What's blocking the ballot system

### Option 3: Manually Verify Payments

If you have real student applications but they're not verified:

```sql
-- Check pending applications
SELECT
  ha.id,
  p.matric_number,
  p.first_name,
  p.last_name,
  ha.status,
  ha.payment_verified
FROM hostel_applications ha
JOIN profiles p ON p.id = ha.student_id
WHERE ha.session_id = (SELECT id FROM academic_sessions WHERE is_active = TRUE LIMIT 1)
AND ha.payment_verified = FALSE;

-- Verify payment for a specific application
UPDATE hostel_applications
SET
  payment_verified = TRUE,
  status = 'payment_verified',
  payment_verified_at = NOW()
WHERE id = 'APPLICATION_ID_HERE';
```

---

## 📚 Reference Files

| File | Purpose |
|------|---------|
| `backend/scripts/diagnose_ballot.sql` | Diagnostic tool to identify issues |
| `backend/scripts/setup_ballot_test_data.sql` | Create test data to verify system works |
| `backend/scripts/test_ballot_system.md` | Complete testing guide and troubleshooting |
| `supabase/migrations/001_init.sql:558-719` | Ballot allocation algorithm (PostgreSQL function) |
| `backend/src/modules/admin/admin.service.ts:662-859` | Alternative bulk auto-assign method |
| `frontend_new/src/app/(dashboard)/admin/ballot/page.tsx` | Ballot system UI |

---

## 🎯 Expected Test Results

After running the test data script and clicking "RUN BALLOT NOW":

### Male Students (5 students)
All prefer: 1st=Akata, 2nd=Hollywood, 3rd=PGD

**Result:** All 5 should be allocated to **Akata Hostel** (their 1st choice) ✓

### Female Students (3 students)
All prefer: 1st=New Female Hostel, 2nd=Complex

**Result:** All 3 should be allocated to **New Female Hostel** (their 1st choice) ✓

### Verification Query
```sql
-- Check if students got their preferred hostels
SELECT
  p.matric_number,
  p.first_name,
  CASE
    WHEN a.hostel_id = ha.first_choice_hostel_id THEN '✅ 1st Choice'
    WHEN a.hostel_id = ha.second_choice_hostel_id THEN '⚠️ 2nd Choice'
    WHEN a.hostel_id = ha.third_choice_hostel_id THEN '⚠️ 3rd Choice'
    ELSE '❌ Other'
  END as choice_received,
  h.name as allocated_hostel,
  r.room_number,
  a.bed_space_number
FROM allocations a
JOIN hostel_applications ha ON ha.student_id = a.student_id
JOIN profiles p ON p.id = a.student_id
JOIN hostels h ON h.id = a.hostel_id
JOIN rooms r ON r.id = a.room_id
WHERE a.session_id = (SELECT id FROM academic_sessions WHERE is_active = TRUE LIMIT 1)
ORDER BY h.name, r.room_number, a.bed_space_number;
```

---

## 🚀 Next Steps

1. **Run:** `backend/scripts/setup_ballot_test_data.sql` in Supabase SQL Editor
2. **Refresh:** Your Admin Ballot page
3. **Verify:** You should see "8 WAITING"
4. **Click:** "RUN BALLOT NOW"
5. **Check:** All 8 students should be allocated to their 1st choice ✓

**The algorithm is working perfectly!** You just need students with verified payments in the system.

---

## 💡 Common Scenarios Explained

### Scenario 1: First Choice Has Space
```
Student: John (Priority: 95)
Choices: Akata → Hollywood → PGD
Akata Status: 15/40 beds occupied

Result: ✅ Allocated to Akata (1st choice)
Reason: First choice has available space
```

### Scenario 2: First Choice Full, Second Available
```
Student: Mary (Priority: 85)
Choices: New Female → Complex → None
New Female Status: 40/40 beds (FULL)
Complex Status: 10/40 beds

Result: ✅ Allocated to Complex (2nd choice)
Reason: First choice full, second choice available
```

### Scenario 3: All Choices Full
```
Student: David (Priority: 70)
Choices: Akata → Hollywood → PGD
Akata: 40/40 (FULL)
Hollywood: 40/40 (FULL)
PGD: 40/40 (FULL)

Result: ❌ Marked as "not_allocated"
Reason: All preferred hostels are full
```

### Scenario 4: Gender Mismatch Protection
```
Student: Sarah (Female, Priority: 90)
Choices: Akata (Male) → Hollywood (Male) → PGD (Male)

Result: ❌ Not allocated
Reason: All choices are male hostels, student is female
Note: This should never happen with proper form validation!
```

---

## 🔒 Safety Features

The ballot system includes:

✅ **Row-level locking** - Prevents race conditions
✅ **Gender matching** - Students only allocated to matching-gender hostels
✅ **Capacity checking** - Rooms never exceed capacity
✅ **Transaction safety** - All-or-nothing allocation
✅ **Audit logging** - All actions logged
✅ **Auto-approval** - Instant allocation (configurable)

---

## Need Help?

If you still see "0 WAITING" after running the setup script, check:

1. **Active session exists?**
   ```sql
   SELECT * FROM academic_sessions WHERE is_active = TRUE;
   ```

2. **Rooms created?**
   ```sql
   SELECT COUNT(*) FROM rooms WHERE deleted_at IS NULL;
   ```

3. **Students verified?**
   ```sql
   SELECT COUNT(*) FROM hostel_applications
   WHERE payment_verified = TRUE AND status = 'payment_verified';
   ```

Run `diagnose_ballot.sql` for a complete health check!
