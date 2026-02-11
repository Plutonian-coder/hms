Admin Allocation Flow:

✅ Admin verifies students (payment confirmed, documents checked)
✅ Admin multi-selects verified students (checkbox selection)
✅ Clicks "Auto Assign" button
✅ System automatically allocates rooms based on priority algorithm
✅ Admin can view detailed room occupancy with roommate lists

Roommate Tracking Needs:

See all students in each room
Know current occupancy vs capacity
Monitor room status in real-time
Track roommate compatibility/issues


Solution Design:
Database Structure for Roommate Tracking
sql-- Rooms table
rooms
  - id
  - hostel_id
  - room_number
  - capacity (e.g., 2, 4, 6)
  - current_occupancy (calculated field)
  - gender
  - room_type

-- Allocations table (many-to-one with rooms)
allocations
  - id
  - student_id (FK)
  - room_id (FK)
  - bed_number (1, 2, 3, 4...)
  - session_id
  - allocation_date
  - status (active, checked_out)
  - created_at

-- Students table
students
  - id
  - matric_number
  - full_name
  - gender
  - level
  - department
  - phone
  - photo_url
API Endpoints for This Feature
javascript// Admin selects students and triggers auto-allocation
POST /api/v1/admin/allocations/bulk-auto-assign
{
  "student_ids": [101, 102, 103, 104, ...],
  "session_id": 5,
  "allocation_mode": "priority_based" // or "random"
}

Response:
{
  "success": true,
  "allocated_count": 45,
  "failed_count": 3,
  "allocations": [
    {
      "student_id": 101,
      "student_name": "John Doe",
      "room_id": 25,
      "room_number": "A-101",
      "bed_number": 1
    },
    ...
  ],
  "failed_students": [
    {
      "student_id": 150,
      "reason": "No available rooms matching gender"
    }
  ]
}

// Get room details with all occupants
GET /api/v1/admin/rooms/:roomId/occupants

Response:
{
  "room": {
    "id": 25,
    "room_number": "A-101",
    "hostel_name": "Complex Hostel",
    "capacity": 4,
    "current_occupancy": 3,
    "gender": "male",
    "available_beds": 1
  },
  "occupants": [
    {
      "student_id": 101,
      "matric_number": "2023/ND/CSC/001",
      "full_name": "John Doe",
      "level": 200,
      "department": "Computer Science",
      "phone": "08012345678",
      "photo_url": "https://...",
      "bed_number": 1,
      "check_in_date": "2024-09-15",
      "status": "active"
    },
    {
      "student_id": 102,
      "matric_number": "2023/ND/CSC/002",
      "full_name": "Jane Smith",
      "level": 200,
      "department": "Computer Science",
      "phone": "08098765432",
      "photo_url": "https://...",
      "bed_number": 2,
      "check_in_date": "2024-09-15",
      "status": "active"
    },
    // ... more roommates
  ]
}

// Get all rooms with occupancy summary
GET /api/v1/admin/rooms?hostel_id=5&include_occupants=true

Response:
{
  "rooms": [
    {
      "id": 25,
      "room_number": "A-101",
      "capacity": 4,
      "current_occupancy": 3,
      "occupancy_percentage": 75,
      "status": "partially_filled",
      "occupants_preview": ["John Doe", "Jane Smith", "Ahmed Ali"]
    },
    {
      "id": 26,
      "room_number": "A-102",
      "capacity": 4,
      "current_occupancy": 4,
      "occupancy_percentage": 100,
      "status": "full",
      "occupants_preview": ["Mary Johnson", "Sarah Brown", "Lisa White", "Grace Green"]
    },
    {
      "id": 27,
      "room_number": "A-103",
      "capacity": 4,
      "current_occupancy": 0,
      "occupancy_percentage": 0,
      "status": "empty",
      "occupants_preview": []
    }
  ],
  "summary": {
    "total_rooms": 50,
    "total_capacity": 200,
    "total_occupied": 175,
    "occupancy_rate": 87.5,
    "available_spaces": 25
  }
}

Backend Logic for Auto-Allocation
javascript// services/allocationService.js

async function bulkAutoAssign(studentIds, sessionId, mode = 'priority_based') {
  const allocations = [];
  const failures = [];
  
  // 1. Get all verified students with their details
  const students = await Student.findAll({
    where: { id: studentIds },
    include: [
      { model: HostelApplication, where: { session_id: sessionId } },
      { model: Payment, where: { status: 'verified' } }
    ]
  });
  
  // 2. Calculate priority scores if mode is priority_based
  if (mode === 'priority_based') {
    students.forEach(student => {
      student.priority_score = calculatePriorityScore(student);
    });
    // Sort by priority (highest first)
    students.sort((a, b) => b.priority_score - a.priority_score);
  } else {
    // Random shuffle
    students.sort(() => Math.random() - 0.5);
  }
  
  // 3. Get available rooms grouped by gender
  const maleRooms = await getAvailableRooms('male', sessionId);
  const femaleRooms = await getAvailableRooms('female', sessionId);
  
  // 4. Allocate students to rooms
  for (const student of students) {
    const availableRooms = student.gender === 'male' ? maleRooms : femaleRooms;
    
    // Try to match student's hostel preference
    let allocatedRoom = findRoomByPreference(
      availableRooms, 
      student.application.first_choice_hostel_id
    );
    
    // If preferred hostel full, try second choice
    if (!allocatedRoom) {
      allocatedRoom = findRoomByPreference(
        availableRooms, 
        student.application.second_choice_hostel_id
      );
    }
    
    // If still no room, assign to any available room
    if (!allocatedRoom) {
      allocatedRoom = availableRooms.find(room => 
        room.current_occupancy < room.capacity
      );
    }
    
    if (allocatedRoom) {
      // Find next available bed number
      const bedNumber = await getNextAvailableBed(allocatedRoom.id);
      
      // Create allocation
      const allocation = await Allocation.create({
        student_id: student.id,
        room_id: allocatedRoom.id,
        bed_number: bedNumber,
        session_id: sessionId,
        allocation_date: new Date(),
        status: 'active'
      });
      
      // Update room occupancy
      await allocatedRoom.increment('current_occupancy');
      
      allocations.push({
        student_id: student.id,
        student_name: student.full_name,
        room_id: allocatedRoom.id,
        room_number: allocatedRoom.room_number,
        bed_number: bedNumber
      });
      
      // Send notification to student
      await sendAllocationNotification(student, allocatedRoom, bedNumber);
      
    } else {
      // No room available
      failures.push({
        student_id: student.id,
        student_name: student.full_name,
        reason: `No available rooms for ${student.gender} students`
      });
    }
  }
  
  return {
    allocated_count: allocations.length,
    failed_count: failures.length,
    allocations,
    failed_students: failures
  };
}

async function getAvailableRooms(gender, sessionId) {
  return await Room.findAll({
    where: {
      gender,
      is_available: true
    },
    include: [
      {
        model: Allocation,
        where: { 
          session_id: sessionId,
          status: 'active'
        },
        required: false // LEFT JOIN to include empty rooms
      }
    ],
    having: sequelize.literal('current_occupancy < capacity'),
    order: [['room_number', 'ASC']]
  });
}

async function getNextAvailableBed(roomId) {
  const room = await Room.findByPk(roomId, {
    include: [{ model: Allocation, where: { status: 'active' } }]
  });
  
  const occupiedBeds = room.allocations.map(a => a.bed_number);
  
  // Find first available bed number (1 to capacity)
  for (let bed = 1; bed <= room.capacity; bed++) {
    if (!occupiedBeds.includes(bed)) {
      return bed;
    }
  }
  
  throw new Error('No available beds in this room');
}

Admin Dashboard UI Design
1. Student Verification Page (with Multi-Select)
jsx// AdminStudentVerification.jsx

function AdminStudentVerification() {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedStudents(students.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleBulkAutoAssign = async () => {
    setLoading(true);
    try {
      const response = await api.post('/admin/allocations/bulk-auto-assign', {
        student_ids: selectedStudents,
        session_id: currentSession.id,
        allocation_mode: 'priority_based'
      });
      
      toast.success(`${response.allocated_count} students allocated successfully`);
      
      if (response.failed_count > 0) {
        toast.warning(`${response.failed_count} students could not be allocated`);
      }
      
      // Refresh data
      fetchStudents();
      setSelectedStudents([]);
      
    } catch (error) {
      toast.error('Allocation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Verified Students</h1>
        <button
          onClick={handleBulkAutoAssign}
          disabled={selectedStudents.length === 0 || loading}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Allocating...' : `Auto Assign (${selectedStudents.length})`}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  checked={selectedStudents.length === students.length}
                />
              </th>
              <th className="p-3 text-left">Matric No.</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Level</th>
              <th className="p-3 text-left">Payment Status</th>
              <th className="p-3 text-left">Priority Score</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} className="border-t">
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, student.id]);
                      } else {
                        setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                      }
                    }}
                  />
                </td>
                <td className="p-3">{student.matric_number}</td>
                <td className="p-3">{student.full_name}</td>
                <td className="p-3">{student.level}</td>
                <td className="p-3">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    Verified
                  </span>
                </td>
                <td className="p-3">{student.priority_score.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
2. Room Occupancy View (Showing Roommates)
jsx// RoomOccupancyView.jsx

function RoomOccupancyView({ hostelId }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [occupants, setOccupants] = useState([]);

  const viewRoomDetails = async (roomId) => {
    const response = await api.get(`/admin/rooms/${roomId}/occupants`);
    setSelectedRoom(response.room);
    setOccupants(response.occupants);
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left: Room List */}
      <div className="col-span-1 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Rooms</h2>
        <div className="space-y-2">
          {rooms.map(room => (
            <div
              key={room.id}
              onClick={() => viewRoomDetails(room.id)}
              className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                selectedRoom?.id === room.id ? 'border-blue-500 bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{room.room_number}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  room.status === 'full' ? 'bg-red-100 text-red-800' :
                  room.status === 'empty' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {room.current_occupancy}/{room.capacity}
                </span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {room.occupancy_percentage}% occupied
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Room Details & Occupants */}
      <div className="col-span-2 bg-white rounded-lg shadow p-6">
        {selectedRoom ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{selectedRoom.room_number}</h2>
              <p className="text-gray-600">
                {selectedRoom.hostel_name} • Capacity: {selectedRoom.capacity}
              </p>
            </div>

            <h3 className="text-lg font-semibold mb-4">
              Roommates ({occupants.length})
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {occupants.map(student => (
                <div key={student.student_id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={student.photo_url || '/default-avatar.png'}
                      alt={student.full_name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{student.full_name}</h4>
                      <p className="text-sm text-gray-600">{student.matric_number}</p>
                      <p className="text-sm text-gray-600">{student.department}</p>
                      <div className="mt-2 flex gap-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          Bed {student.bed_number}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                          Level {student.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      Check-in: {new Date(student.check_in_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">Phone: {student.phone}</p>
                  </div>
                </div>
              ))}

              {/* Show empty beds */}
              {Array.from({ length: selectedRoom.capacity - occupants.length }).map((_, i) => (
                <div key={`empty-${i}`} className="border border-dashed rounded-lg p-4 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🛏️</div>
                    <p className="text-sm">Bed {occupants.length + i + 1}</p>
                    <p className="text-xs">Available</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-12">
            Select a room to view occupants
          </div>
        )}
      </div>
    </div>
  );
}
3. Dashboard Overview (Summary Cards)
jsx// OccupancyDashboard.jsx

function OccupancyDashboard() {
  const [stats, setStats] = useState({
    total_rooms: 0,
    total_capacity: 0,
    total_occupied: 0,
    occupancy_rate: 0,
    full_rooms: 0,
    empty_rooms: 0
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Hostel Occupancy Overview</h1>
      
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm mb-2">Total Rooms</div>
          <div className="text-3xl font-bold">{stats.total_rooms}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm mb-2">Total Capacity</div>
          <div className="text-3xl font-bold">{stats.total_capacity}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm mb-2">Occupied Beds</div>
          <div className="text-3xl font-bold text-blue-600">{stats.total_occupied}</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm mb-2">Occupancy Rate</div>
          <div className="text-3xl font-bold text-green-600">
            {stats.occupancy_rate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Room status breakdown */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-900 font-semibold">Full Rooms</div>
          <div className="text-2xl font-bold text-red-600">{stats.full_rooms}</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-900 font-semibold">Partially Filled</div>
          <div className="text-2xl font-bold text-yellow-600">
            {stats.total_rooms - stats.full_rooms - stats.empty_rooms}
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-gray-900 font-semibold">Empty Rooms</div>
          <div className="text-2xl font-bold text-gray-600">{stats.empty_rooms}</div>
        </div>
      </div>
    </div>
  );
}

Performance Optimization for Room Tracking
javascript// Use database views for better performance

CREATE VIEW room_occupancy_summary AS
SELECT 
  r.id as room_id,
  r.room_number,
  r.capacity,
  COUNT(a.id) as current_occupancy,
  (COUNT(a.id)::float / r.capacity * 100) as occupancy_percentage,
  CASE 
    WHEN COUNT(a.id) = 0 THEN 'empty'
    WHEN COUNT(a.id) = r.capacity THEN 'full'
    ELSE 'partially_filled'
  END as status,
  h.name as hostel_name,
  h.gender
FROM rooms r
LEFT JOIN allocations a ON a.room_id = r.id 
  AND a.status = 'active'
  AND a.session_id = (SELECT id FROM academic_sessions WHERE is_active = true)
LEFT JOIN hostels h ON h.id = r.hostel_id
GROUP BY r.id, r.room_number, r.capacity, h.name, h.gender;

-- Query becomes super fast
SELECT * FROM room_occupancy_summary WHERE hostel_id = 5;

Summary
Your workflow:

✅ Students apply → pay → get verified
✅ Admin multi-selects verified students
✅ Clicks "Auto Assign" button
✅ System allocates automatically using priority algorithm
✅ Admin views detailed room occupancy with all roommates clearly displayed

Benefits:

Fast bulk allocation (no manual room selection)
Clear visibility of roommates in each room
Real-time occupancy tracking
Better performance monitoring
Easy to spot issues (overcrowding, empty rooms)