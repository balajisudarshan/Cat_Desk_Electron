# Cat-Desk Admin API Documentation

This document provides a comprehensive reference of all API endpoints implemented in the **Cat-Desk Admin** backend service.

---

## 1. Quick Summary Table

| Method | Endpoint | Description | Request Format | Response Status & Format |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/course` | Creates a new course | JSON Body (`name`, `totalFee`) | `200 OK` &rarr; Course Object |
| **GET** | `/api/course` | Retrieves all courses | None | `202 Accepted` &rarr; Array of Course Objects |
| **PATCH** | `/api/course/:id` | Updates total fee for a specific course | JSON Body (`newFee`) | `200 OK` &rarr; Success message & Course Object |
| **DELETE** | `/api/course/:id` | Deletes a course by ID | URL Param (`id`) | `200 OK` &rarr; Success message |
| **GET** | `/api/student` | Retrieves all registered students | None | `200 OK` &rarr; Array of Student Objects |
| **POST** | `/api/student` | Registers a new student | JSON Body (`name`, `phone`, `f_name`, `address`, `email`, `regNo`) | `200 OK` &rarr; Success message & Student Object |
| **GET** | `/api/student/:id` | Retrieves a single student by numeric ID | URL Param (`id`) | `200 OK` &rarr; Student Object |
| **GET** | `/api/student/regNo/:regNo` | Retrieves a single student by registration number | URL Param (`regNo`) | `200 OK` &rarr; Student Object |
| **PATCH** | `/api/student/:id` | Updates student status (`true`/`false`) | JSON Body (`status`) | `200 OK` &rarr; Success message & Student Object |
| **DELETE** | `/api/student/:id` | Deletes a student by ID | URL Param (`id`) | `200 OK` &rarr; Success message & Student Object |
| **POST** | `/api/batch` | Creates a new batch with course, timings, dates, and capacity | JSON Body (`courseId`, `batchName`, `startTime`, `endTime`, `days`, `startDate`, `endDate`, `maxStudents`) | `201 Created` &rarr; Batch Object |
| **GET** | `/api/batch` | Retrieves all batches with course info and enrolled count | None | `200 OK` &rarr; Array of Batch Objects |
| **GET** | `/api/batch/course/:courseId` | Retrieves all batches for a specific course | URL Param (`courseId`) | `200 OK` &rarr; Array of Batch Objects |
| **GET** | `/api/batch/:id` | Retrieves batch details with all enrolled students | URL Param (`id`) | `200 OK` &rarr; Batch Object with Students list |
| **PATCH** | `/api/batch/:id` | Updates batch timings, schedule, status, or capacity | JSON Body (`batchName`, `startTime`, `endTime`, `days`, `status`, etc.) | `200 OK` &rarr; Updated Batch Object |
| **DELETE** | `/api/batch/:id` | Deletes a batch | URL Param (`id`) | `200 OK` &rarr; Success message |
| **POST** | `/api/batch/:batchId/student` | Assigns a student to a batch | JSON Body (`regNo` or `studentId`) | `201 Created` &rarr; Assignment details |
| **DELETE** | `/api/batch/:batchId/student/:studentId` | Removes a student from a batch | URL Params (`batchId`, `studentId`) | `200 OK` &rarr; Success message |
| **POST** | `/api/enrollment` | Enrolls student into course(s), assigns batch, computes fees, creates payment record | JSON Body (`reg_no`, `course_ids`, `batch_id`, `timings`, `discount`, `payment_mode`, `amount_paid`) | `201 Created` &rarr; Success message & Enrolled Course IDs |
| **GET** | `/api/enrollment/student/:id` | Retrieves all course enrollments for a student | URL Param (`:id` / `:reg_no`) | `200 OK` &rarr; Array of Enrollment Objects with Course & Student info |
| **GET** | `/api/history/:regNo` | Fetches complete student dossier (details, enrolled courses, payment plans, and payment history) | URL Param (`regNo`) | `200 OK` &rarr; Comprehensive Dossier Object |
| **POST** | `/api/payment/add` | Adds an installment payment against outstanding student fees | JSON Body (`reg_no`, `amount_paid`, `payment_method`) | `200 OK` &rarr; Success message & Updated Payment Record |
| **GET** | `/api/receipt/:reg_no` | Generates and downloads a formatted PDF payment receipt | URL Param (`reg_no`) | `200 OK` &rarr; Binary PDF Stream (`application/pdf`) |

---

## 2. Detailed Endpoints by Module

---

### Course Management (`/api/course`)

#### 1. Add Course
- **Endpoint**: `POST /api/course`
- **Controller Action**: `addCourse`
- **Description**: Inserts a new course with its standard fee into the `courses` table.

##### Request Body
```json
{
  "name": "Full Stack Web Development",
  "totalFee": 25000
}
```

##### Response (`200 OK`)
```json
{
  "id": 1,
  "name": "Full Stack Web Development",
  "total_fee": 25000
}
```

##### Error Responses
- `500 Internal Server Error`:
```json
{
  "message": "Error occured"
}
```

---

#### 2. Get All Courses
- **Endpoint**: `GET /api/course`
- **Controller Action**: `getAllCourses`
- **Description**: Retrieves all courses present in the database.

##### Request
No parameters or body required.

##### Response (`202 Accepted`)
```json
[
  {
    "id": 1,
    "name": "Full Stack Web Development",
    "total_fee": 25000
  },
  {
    "id": 2,
    "name": "Data Analytics with Python",
    "total_fee": 30000
  }
]
```

##### Error Responses
- `500 Internal Server Error`:
```json
{
  "message": "Error"
}
```

---

#### 3. Update Course Fee
- **Endpoint**: `PATCH /api/course/:id`
- **Controller Action**: `updateCourseFee`
- **Description**: Updates the `total_fee` for the course specified by `id`.

##### URL Parameters
- `id` (integer, required): ID of the course to update.

##### Request Body
```json
{
  "newFee": 28000
}
```

##### Response (`200 OK`)
```json
{
  "message": "Updated the fee successfully",
  "data": {
    "id": 1,
    "name": "Full Stack Web Development",
    "total_fee": 28000
  }
}
```

##### Error Responses
- `404 Not Found`:
```json
{
  "message": "Course not found"
}
```
- `500 Internal Server Error`:
```json
{
  "message": "Error while updating the fee"
}
```

---

#### 4. Delete Course
- **Endpoint**: `DELETE /api/course/:id`
- **Controller Action**: `deleteCourse`
- **Description**: Deletes a course from the database by its `id`.

##### URL Parameters
- `id` (integer, required): Course ID to delete.

##### Response (`200 OK`)
```json
{
  "message": "Deleted successfully"
}
```

##### Error Responses
- `500 Internal Server Error`:
```json
{
  "message": "Error occured when deleting the course"
}
```

---

### Student Management (`/api/student`)

#### 1. Add Student
- **Endpoint**: `POST /api/student`
- **Controller Action**: `addStudent`
- **Description**: Creates a new student record with active status `true`.

##### Request Body
```json
{
  "name": "Alice Johnson",
  "phone": "+91 9876543210",
  "f_name": "Robert Johnson",
  "address": "45 Park Avenue, Mumbai",
  "email": "alice.johnson@example.com",
  "regNo": "REG-2026-001"
}
```

##### Response (`200 OK`)
```json
{
  "message": "Student added successfully",
  "data": {
    "id": 1,
    "name": "Alice Johnson",
    "phone": "+91 9876543210",
    "f_name": "Robert Johnson",
    "address": "45 Park Avenue, Mumbai",
    "status": true,
    "email": "alice.johnson@example.com",
    "reg_no": "REG-2026-001"
  }
}
```

##### Error Responses
- `404 Not Found` (Missing required fields):
```json
{
  "message": "Please enter all fields"
}
```
- `400 Bad Request` (Duplicate Registration Number):
```json
{
  "message": "Student With this Registration Number already exists"
}
```
- `500 Internal Server Error`:
```json
{
  "message": "Error while adding the student"
}
```

---

#### 2. Get All Students
- **Endpoint**: `GET /api/student`
- **Controller Action**: `getAllStudents`
- **Description**: Retrieves a list of all registered students.

##### Response (`200 OK`)
```json
[
  {
    "id": 1,
    "name": "Alice Johnson",
    "phone": "+91 9876543210",
    "f_name": "Robert Johnson",
    "address": "45 Park Avenue, Mumbai",
    "status": true,
    "email": "alice.johnson@example.com",
    "reg_no": "REG-2026-001"
  }
]
```

##### Error Responses
- `500 Internal Server Error`:
```json
{
  "message": "Error while fetching the students"
}
```

---

#### 3. Get Student by ID
- **Endpoint**: `GET /api/student/:id`
- **Controller Action**: `getStudent`
- **Description**: Retrieves student details using their database record `id`.

##### URL Parameters
- `id` (integer, required): Student database ID.

##### Response (`200 OK`)
```json
{
  "id": 1,
  "name": "Alice Johnson",
  "phone": "+91 9876543210",
  "f_name": "Robert Johnson",
  "address": "45 Park Avenue, Mumbai",
  "status": true,
  "email": "alice.johnson@example.com",
  "reg_no": "REG-2026-001"
}
```

##### Error Responses
- `404 Not Found`:
```json
{
  "message": "Student not found"
}
```
- `500 Internal Server Error`:
```json
{
  "message": "Error while fetching the student"
}
```

---

#### 4. Get Student by Registration Number
- **Endpoint**: `GET /api/student/regNo/:regNo`
- **Controller Action**: `getStudentByRegNo`
- **Description**: Retrieves student details using their unique registration number `reg_no`.

##### URL Parameters
- `regNo` (string, required): Unique registration code of the student.

##### Response (`200 OK`)
```json
{
  "id": 1,
  "name": "Alice Johnson",
  "phone": "+91 9876543210",
  "f_name": "Robert Johnson",
  "address": "45 Park Avenue, Mumbai",
  "status": true,
  "email": "alice.johnson@example.com",
  "reg_no": "REG-2026-001"
}
```

##### Error Responses
- `404 Not Found`:
```json
{
  "message": "Student not found"
}
```
- `500 Internal Server Error`:
```json
{
  "message": "Error while fetching the student"
}
```

---

#### 5. Update Student Status
- **Endpoint**: `PATCH /api/student/:id`
- **Controller Action**: `updateStudentStatus`
- **Description**: Updates the `status` (active / inactive flag) of a student.

##### URL Parameters
- `id` (integer, required): Student ID.

##### Request Body
```json
{
  "status": false
}
```

##### Response (`200 OK`)
```json
{
  "message": "Status updated successfully",
  "data": {
    "id": 1,
    "name": "Alice Johnson",
    "phone": "+91 9876543210",
    "f_name": "Robert Johnson",
    "address": "45 Park Avenue, Mumbai",
    "status": false,
    "email": "alice.johnson@example.com",
    "reg_no": "REG-2026-001"
  }
}
```

##### Error Responses
- `400 Bad Request`:
```json
{
  "message": "Invalid status"
}
```
- `500 Internal Server Error`:
```json
{
  "message": "Error while updating the student"
}
```

---

#### 6. Delete Student
- **Endpoint**: `DELETE /api/student/:id`
- **Controller Action**: `deleteStudent`
- **Description**: Deletes a student record by ID.

##### URL Parameters
- `id` (integer, required): Student ID.

##### Response (`200 OK`)
```json
{
  "message": "Student Deleted Successfully",
  "data": {
    "id": 1,
    "name": "Alice Johnson",
    "phone": "+91 9876543210",
    "f_name": "Robert Johnson",
    "address": "45 Park Avenue, Mumbai",
    "status": false,
    "email": "alice.johnson@example.com",
    "reg_no": "REG-2026-001"
  }
}
```

##### Error Responses
- `404 Not Found`:
```json
{
  "message": "Student not found"
}
```
- `500 Internal Server Error`:
```json
{
  "message": "Error occured when deleting the student"
}
```

---

### Enrollment Management (`/api/enrollment`)

#### 1. Add Enrollment
- **Endpoint**: `POST /api/enrollment`
- **Controller Action**: `addEnrollment`
- **Description**: Enrolls a student into one or multiple courses, calculates total fees, applies discount, initializes the payment ledger, and creates an initial payment history record if `amount_paid > 0`.

##### Request Body
```json
{
  "reg_no": "REG-2026-001",
  "course_ids": [1, 2],
  "timings": "10:00 AM - 12:00 PM",
  "discount": 3000,
  "payment_mode": "Installment",
  "payment_type": "Cash",
  "amount_paid": 10000
}
```

##### Response (`201 Created`)
```json
{
  "message": "Enrollment added successfully",
  "data": [1, 2]
}
```

##### Error Responses
- `400 Bad Request`:
```json
{
  "message": "Please enter all fields"
}
```
- `404 Not Found`:
```json
{
  "message": "Student with this registration number not found"
}
```
- `500 Internal Server Error`:
```json
{
  "message": "Error while adding enrollment"
}
```

---

#### 2. Get Student Enrollment
- **Endpoint**: `GET /api/enrollment/student/:id`
- **Controller Action**: `getStudentEnrollment`
- **Description**: Fetches all courses a specific student is enrolled in with timing and course fees.
> *Note: In `enrollment.controller.js`, the code extracts `const { reg_no } = req.params;`. If using this endpoint, provide the registration number or update the route parameter name accordingly.*

##### Response (`200 OK`)
```json
[
  {
    "student_name": "Alice Johnson",
    "reg_no": "REG-2026-001",
    "course_name": "Full Stack Web Development",
    "timings": "10:00 AM - 12:00 PM",
    "course_fee": 25000
  },
  {
    "student_name": "Alice Johnson",
    "reg_no": "REG-2026-001",
    "course_name": "Data Analytics with Python",
    "timings": "10:00 AM - 12:00 PM",
    "course_fee": 30000
  }
]
```

##### Error Responses
- `404 Not Found`:
```json
{
  "message": "Student not found"
}
```
- `500 Internal Server Error`:
```json
{
  "message": "Error while getting enrollments"
}
```

---

### Student Dossier & History (`/api/history`)

#### 1. Get Full Student History
- **Endpoint**: `GET /api/history/:regNo`
- **Controller Action**: `getFullHistory`
- **Description**: Returns complete student dossier: basic details, enrolled courses, payment summary breakdown, and chronological payment transaction history.

##### URL Parameters
- `regNo` (string, required): Registration number of the student.

##### Response (`200 OK`)
```json
{
  "student": {
    "id": 1,
    "name": "Alice Johnson",
    "reg_no": "REG-2026-001",
    "phone": "+91 9876543210",
    "email": "alice.johnson@example.com",
    "address": "45 Park Avenue, Mumbai",
    "status": true
  },
  "enrollments": [
    {
      "course_name": "Full Stack Web Development",
      "timings": "10:00 AM - 12:00 PM",
      "course_fee": 25000
    },
    {
      "course_name": "Data Analytics with Python",
      "timings": "10:00 AM - 12:00 PM",
      "course_fee": 30000
    }
  ],
  "payments": [
    {
      "id": 1,
      "total_fee": 55000,
      "discount": 3000,
      "final_fee": 52000,
      "payment_mode": "Installment",
      "total_paid": 10000,
      "balance": 42000
    }
  ],
  "paymentHistory": [
    {
      "id": 1,
      "payment_id": 1,
      "amount_paid": 10000,
      "payment_method": "Cash",
      "payment_date": "2026-05-29T09:30:00.000Z"
    }
  ]
}
```

##### Error Responses
- `404 Not Found`:
```json
{
  "message": "Student with this registration number not found"
}
```
- `500 Internal Server Error`:
```json
{
  "message": "Error while fetching history"
}
```

---

### Payment Operations (`/api/payment`)

#### 1. Add Installment Payment
- **Endpoint**: `POST /api/payment/add`
- **Controller Action**: `addPayment`
- **Description**: Submits an installment payment for an enrolled student. Automatically deduces balance across open payment ledger records, updates `total_paid` and `balance`, and records an entry in `payment_history`.

##### Request Body
```json
{
  "reg_no": "REG-2026-001",
  "amount_paid": 15000,
  "payment_method": "UPI"
}
```

##### Response (`200 OK`)
```json
{
  "message": "Payment added successfully",
  "data": {
    "id": 1,
    "reg_no": "REG-2026-001",
    "total_fee": 55000,
    "discount": 3000,
    "final_fee": 52000,
    "total_paid": 25000,
    "balance": 27000,
    "payment_mode": "Installment"
  }
}
```

##### Error Responses
- `400 Bad Request` (Invalid Inputs):
```json
{
  "message": "Please enter valid reg_no, amount_paid and payment_method"
}
```
- `400 Bad Request` (Payment higher than balance):
```json
{
  "message": "Amount Exceeds Balance"
}
```
- `404 Not Found`:
```json
{
  "message": "No payment record found for this registration number"
}
```
- `500 Internal Server Error`:
```json
{
  "message": "Internal Server Error when adding payment"
}
```

---

### Receipt Generation (`/api/receipt`)

#### 1. Download Payment Receipt PDF
- **Endpoint**: `GET /api/receipt/:reg_no`
- **Controller Action**: `generateReceipt`
- **Description**: Generates an A4 PDF document containing student info, itemized payment history table, and fee balance summary.

##### URL Parameters
- `reg_no` (string, required): Registration number of the student.

##### Response Headers (`200 OK`)
```http
Content-Type: application/pdf
Content-Disposition: attachment; filename=receipt-REG-2026-001.pdf
```

##### Response Body
- **Binary PDF stream** generated with `pdfkit` containing:
  - Header with title and Registration Number
  - Student Information Card (Name, Registration No)
  - Payment History Table (Receipt ID, Date, Method, Amount)
  - Fee Summary Box (Total Fee, Total Paid, Balance)

##### Error Responses
- `404 Not Found`:
```json
{
  "message": "Receipt not found"
}
```
- `500 Internal Server Error`:
```json
{
  "message": "Receipt generation failed"
}
```

---

## 3. Database Schema Reference

The tables and fields queried across the backend controllers:

| Table | Columns | Used By Endpoints |
| :--- | :--- | :--- |
| `courses` | `id`, `name`, `total_fee` | `/api/course`, `/api/enrollment`, `/api/history` |
| `students` | `id`, `name`, `phone`, `f_name`, `address`, `status`, `email`, `reg_no` | `/api/student`, `/api/enrollment`, `/api/history`, `/api/receipt` |
| `enrollments`| `id`, `course_id`, `timings`, `course_fee`, `reg_no` | `/api/enrollment`, `/api/history` |
| `payments` | `id`, `reg_no`, `total_fee`, `discount`, `final_fee`, `total_paid`, `balance`, `payment_mode` | `/api/enrollment`, `/api/history`, `/api/payment`, `/api/receipt` |
| `payment_history` | `id`, `payment_id`, `amount_paid`, `payment_method`, `payment_date` | `/api/enrollment`, `/api/history`, `/api/payment`, `/api/receipt` |
