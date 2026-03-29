# 🏥 MediCare – Hospital Appointment & Patient Record Management System

A full-stack, production-ready hospital management platform built with **Spring Boot + MongoDB** (backend) and **Vite + React + Tailwind CSS** (frontend).

---

## 📐 Architecture Overview

```
hospital-system/
├── backend/                         # Spring Boot (Java 17, Maven)
│   └── src/main/java/com/hospital/
│       ├── HospitalManagementApplication.java
│       ├── config/
│       │   ├── DataInitializer.java       # Seeds admin/doctor/patient on startup
│       │   └── SecurityConfig.java        # JWT + CORS + Spring Security
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── PatientController.java
│       │   ├── DoctorController.java
│       │   ├── AppointmentController.java
│       │   └── AdminController.java
│       ├── service/
│       │   ├── AuthService.java + impl/AuthServiceImpl.java
│       │   ├── PatientService.java + impl/PatientServiceImpl.java
│       │   ├── DoctorService.java + impl/DoctorServiceImpl.java
│       │   ├── AppointmentService.java + impl/AppointmentServiceImpl.java
│       │   └── AdminService.java + impl/AdminServiceImpl.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── PatientRepository.java
│       │   ├── DoctorRepository.java
│       │   └── AppointmentRepository.java
│       ├── model/
│       │   ├── User.java
│       │   ├── Patient.java
│       │   ├── Doctor.java
│       │   ├── Appointment.java
│       │   └── Role.java
│       ├── dto/
│       │   ├── request/  (RegisterRequest, LoginRequest, AppointmentRequest, …)
│       │   └── response/ (AuthResponse, ApiResponse, DashboardStatsResponse)
│       ├── security/
│       │   ├── JwtUtils.java
│       │   ├── JwtAuthenticationFilter.java
│       │   └── UserDetailsServiceImpl.java
│       └── exception/
│           ├── GlobalExceptionHandler.java
│           ├── ErrorResponse.java
│           ├── ResourceNotFoundException.java
│           ├── DuplicateResourceException.java
│           └── AppointmentConflictException.java
│
├── frontend/                        # Vite + React 18 + Tailwind CSS
│   └── src/
│       ├── App.jsx                  # Router + role-based redirect
│       ├── main.jsx
│       ├── index.css                # Tailwind + custom components
│       ├── api/
│       │   ├── client.js            # Axios with JWT interceptors
│       │   ├── auth.js
│       │   └── index.js             # patientsApi, doctorsApi, appointmentsApi, adminApi
│       ├── context/
│       │   └── AuthContext.jsx      # Global auth state
│       ├── routes/
│       │   └── ProtectedRoute.jsx   # Role-based route guard
│       ├── components/
│       │   ├── layout/DashboardLayout.jsx
│       │   └── common/index.jsx     # StatCard, Modal, Badge, Alert, EmptyState…
│       └── pages/
│           ├── auth/    (LoginPage, RegisterPage)
│           ├── admin/   (AdminDashboard, AdminDoctors, AdminPatients, AdminAppointments)
│           ├── doctor/  (DoctorDashboard, DoctorProfile, DoctorAppointments, DoctorAvailability)
│           └── patient/ (PatientDashboard, PatientProfile, BookAppointment,
│                         PatientAppointments, MedicalHistory)
│
├── mongodb-schema.json              # Full MongoDB collection schemas + sample docs
└── README.md
```

---

## ⚙️ Prerequisites

| Tool       | Minimum Version | Check command          |
|------------|-----------------|------------------------|
| Java       | 17              | `java -version`        |
| Maven      | 3.8+            | `mvn -version`         |
| Node.js    | 18+             | `node -v`              |
| npm        | 9+              | `npm -v`               |
| MongoDB    | 6.0+ (local) **or** Atlas account | `mongod --version` |

---

## 🚀 Setup Guide

### Step 1 – MongoDB

**Option A – Local MongoDB (recommended for development)**
```bash
# macOS
brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community

# Ubuntu / Debian
sudo apt-get install -y mongodb && sudo systemctl start mongod

# Windows – download from https://www.mongodb.com/try/download/community
```
The app auto-creates the `hospital_db` database.

**Option B – MongoDB Atlas (cloud)**
1. Create a free cluster at https://cloud.mongodb.com
2. Whitelist your IP under Network Access
3. Copy the connection string
4. Edit `backend/src/main/resources/application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/hospital_db
   ```

---

### Step 2 – Backend (Spring Boot)

```bash
cd hospital-system/backend

# Build and run
mvn spring-boot:run

# OR build jar first then run
mvn clean package -DskipTests
java -jar target/hospital-management-1.0.0.jar
```

The backend starts on **http://localhost:8080/api**

On first boot, `DataInitializer` automatically seeds:
| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@hospital.com     | admin1234   |
| Doctor  | doctor@hospital.com    | doctor123   |
| Patient | patient@hospital.com   | patient123  |

---

### Step 3 – Frontend (Vite + React)

```bash
cd hospital-system/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend starts on **http://localhost:5173**

> The Vite dev server proxies all `/api` requests to `http://localhost:8080/api` — no CORS issues during development.

---

### Step 4 – Build for Production

**Backend:**
```bash
cd backend
mvn clean package
# Output: target/hospital-management-1.0.0.jar
java -jar target/hospital-management-1.0.0.jar
```

**Frontend:**
```bash
cd frontend
npm run build
# Output: dist/ folder (serve with nginx or any static host)
```

---

## 🔌 API Endpoints Reference

### Authentication  `POST /api/auth/...`
| Method | Endpoint           | Body                               | Auth |
|--------|--------------------|------------------------------------|------|
| POST   | `/auth/register`   | `{firstName, lastName, email, password, phone, role}` | Public |
| POST   | `/auth/login`      | `{email, password}`                | Public |
| POST   | `/auth/refresh`    | Header: `Refresh-Token: <token>`   | Public |

### Patients  `/api/patients/...`
| Method | Endpoint                        | Description               | Roles           |
|--------|---------------------------------|---------------------------|-----------------|
| GET    | `/patients`                     | List all patients         | ADMIN           |
| GET    | `/patients/{id}`                | Get patient by ID         | ADMIN,DOCTOR,PATIENT |
| GET    | `/patients/user/{userId}`       | Get by user ID            | ADMIN,PATIENT   |
| GET    | `/patients/search?query=...`    | Search patients           | ADMIN,DOCTOR    |
| PUT    | `/patients/{id}`                | Update profile            | ADMIN,PATIENT   |
| POST   | `/patients/{id}/medical-records`| Add medical record        | ADMIN,DOCTOR    |
| DELETE | `/patients/{id}`                | Delete patient            | ADMIN           |

### Doctors  `/api/doctors/...`
| Method | Endpoint                               | Description               | Roles          |
|--------|----------------------------------------|---------------------------|----------------|
| GET    | `/doctors`                             | All doctors               | Public         |
| GET    | `/doctors/active`                      | Active doctors only       | Public         |
| GET    | `/doctors/{id}`                        | Doctor detail             | Public         |
| GET    | `/doctors/user/{userId}`               | Get by user ID            | ADMIN,DOCTOR   |
| GET    | `/doctors/search?query=...`            | Search doctors            | Public         |
| GET    | `/doctors/specialization/{spec}`       | Filter by specialization  | Public         |
| GET    | `/doctors/{id}/available-slots?date=`  | Get available time slots  | Public         |
| PUT    | `/doctors/{id}`                        | Update profile            | ADMIN,DOCTOR   |
| PUT    | `/doctors/{id}/availability`           | Update schedule           | ADMIN,DOCTOR   |
| PATCH  | `/doctors/{id}/toggle-status`          | Activate/deactivate       | ADMIN          |
| DELETE | `/doctors/{id}`                        | Delete doctor             | ADMIN          |

### Appointments  `/api/appointments/...`
| Method | Endpoint                                    | Description                | Roles               |
|--------|---------------------------------------------|----------------------------|---------------------|
| POST   | `/appointments/patient/{patientId}`         | Book appointment           | PATIENT,ADMIN       |
| GET    | `/appointments`                             | All appointments           | ADMIN               |
| GET    | `/appointments/{id}`                        | Get by ID                  | Any authenticated   |
| GET    | `/appointments/patient/{patientId}`         | Patient's appointments     | PATIENT,ADMIN       |
| GET    | `/appointments/doctor/{doctorId}`           | Doctor's appointments      | DOCTOR,ADMIN        |
| GET    | `/appointments/doctor/{doctorId}/date?date=`| Doctor's schedule by date  | DOCTOR,ADMIN        |
| PUT    | `/appointments/{id}`                        | Update (notes/status)      | DOCTOR,ADMIN        |
| PATCH  | `/appointments/{id}/cancel`                 | Cancel appointment         | PATIENT,DOCTOR,ADMIN|
| DELETE | `/appointments/{id}`                        | Hard delete                | ADMIN               |

### Admin  `/api/admin/...`
| Method | Endpoint                    | Description         | Roles |
|--------|-----------------------------|---------------------|-------|
| GET    | `/admin/dashboard/stats`    | Dashboard overview  | ADMIN |

---

## 🔐 JWT Flow

```
Client                        Backend
  │                              │
  │  POST /auth/login            │
  │──────────────────────────►  │
  │                              │  Validate credentials
  │                              │  Generate JWT (24h) + Refresh (7d)
  │  ◄──────────────────────────│
  │  { token, refreshToken }     │
  │                              │
  │  GET /appointments           │
  │  Authorization: Bearer <jwt> │
  │──────────────────────────►  │
  │                              │  JwtAuthenticationFilter validates
  │                              │  Sets SecurityContext
  │  ◄──────────────────────────│
  │  { data: [...] }             │
```

---

## 🗄️ MongoDB Collections

See `mongodb-schema.json` for full schemas. Summary:

| Collection     | Key Fields                                           |
|----------------|------------------------------------------------------|
| `users`        | email (unique), password (bcrypt), roles[]           |
| `patients`     | userId (ref users), medicalHistory[], allergies[]    |
| `doctors`      | userId (ref users), availabilitySchedule[], isActive |
| `appointments` | patientId, doctorId, appointmentDate, timeSlot, status |

---

## 🎨 Frontend Pages & Routes

| Route                      | Page                | Access    |
|----------------------------|---------------------|-----------|
| `/login`                   | Login               | Public    |
| `/register`                | Register            | Public    |
| `/admin/dashboard`         | Admin Dashboard     | ADMIN     |
| `/admin/doctors`           | Manage Doctors      | ADMIN     |
| `/admin/patients`          | Manage Patients     | ADMIN     |
| `/admin/appointments`      | All Appointments    | ADMIN     |
| `/doctor/dashboard`        | Doctor Home         | DOCTOR    |
| `/doctor/profile`          | Doctor Profile      | DOCTOR    |
| `/doctor/appointments`     | Doctor Schedule     | DOCTOR    |
| `/doctor/availability`     | Set Availability    | DOCTOR    |
| `/patient/dashboard`       | Patient Home        | PATIENT   |
| `/patient/book`            | Book Appointment    | PATIENT   |
| `/patient/appointments`    | My Appointments     | PATIENT   |
| `/patient/history`         | Medical History     | PATIENT   |
| `/patient/profile`         | Patient Profile     | PATIENT   |

---

## 🛠️ Configuration Reference

### `application.properties` (backend)
```properties
server.port=8080
server.servlet.context-path=/api

# Local MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/hospital_db

# Atlas MongoDB
# spring.data.mongodb.uri=mongodb+srv://user:pass@cluster.mongodb.net/hospital_db

app.jwt.secret=<min-32-char-secret>
app.jwt.expiration-ms=86400000        # 24 hours
app.jwt.refresh-expiration-ms=604800000  # 7 days

app.cors.allowed-origins=http://localhost:5173
```

### `vite.config.js` (frontend)
```js
proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } }
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| `Connection refused` to MongoDB | Ensure `mongod` is running: `brew services start mongodb-community` |
| JWT `401 Unauthorized` | Token expired → re-login or use refresh endpoint |
| CORS errors in browser | Check `app.cors.allowed-origins` includes your frontend URL |
| `BeanCreationException` on startup | Verify MongoDB URI is correct; check `application.properties` |
| Frontend blank page | Check browser console; run `npm install` again |
| `403 Forbidden` on API call | Ensure the JWT role matches the endpoint's `@PreAuthorize` |

---

## 🏗️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite 5, Tailwind CSS 3, Axios, React Router 6 |
| Backend    | Java 17, Spring Boot 3.2, Maven     |
| Security   | Spring Security 6, JWT (jjwt 0.11)  |
| Database   | MongoDB 6+ (Spring Data MongoDB)    |
| Validation | Bean Validation (jakarta.validation)|

---

## 📝 License

MIT © 2024 MediCare Hospital Management System
