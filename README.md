
# 📘 EduFlex  
**Smart Classroom & Timetable Scheduler**

---

## 🌟 Overview  
EduFlex is an **AI-powered Smart Classroom & Timetable Scheduling platform** designed for higher education institutions. It helps administrators, faculty, and students overcome the inefficiencies of manual scheduling by providing **intelligent, automated, and optimized timetables** tailored to institutional needs.  

With the rise of **multidisciplinary curricula and NEP 2020**, traditional scheduling methods fall short in managing the complexities of real-time faculty availability, infrastructure constraints, elective choices, and student preferences. EduFlex solves this by combining **AI optimization** with **real-time conflict detection** to ensure seamless scheduling.  

---

## 🚀 Key Features  
✅ **AI-Powered Timetable Generation** – Generate optimized schedules within seconds  
✅ **Conflict Detection** – Prevent clashes in faculty, rooms, and subjects in real time  
✅ **Rescheduling Assistant** – Suggest alternative slots, rooms, and faculty adjustments  
✅ **Multi-Department & Multi-Shift Support** – Handle UG, PG, electives, and lab schedules  
✅ **Faculty & Classroom Management** – Track teaching load, availability, and leaves  
✅ **Interactive Dashboard** – Intuitive UI for monitoring schedules and adjustments  
✅ **Approval Workflow** – Allow competent authorities to review and approve schedules  
✅ **Export & Sharing** – Download timetables in **PDF/Excel** or share instantly  

---

## 🎯 Problem Statement  
Higher education institutions often face challenges in efficient class scheduling due to:  
- Limited infrastructure (classrooms/labs)  
- Uneven faculty workload  
- Overlapping departmental requirements  
- Manual dependency on spreadsheets  
- Poor resource utilization  

This leads to **frequent clashes, underutilization of rooms, and dissatisfaction among faculty & students**.  

EduFlex addresses these challenges by providing **adaptive, optimized, and scalable timetable generation**.  

---

## 🔑 Key Parameters Considered  
EduFlex factors in multiple real-world variables, including:  
- Number of classrooms & labs available  
- Student batches & semester-wise subject allocation  
- Maximum classes per day per student/faculty  
- Teaching load norms per subject/week  
- Faculty availability & average leave patterns  
- Special fixed-slot classes (labs, electives, seminars)  
- Student-friendly distribution of lectures  

---

## 🛠️ Tech Stack  
**Frontend:** ⚡ React + TypeScript + TailwindCSS + ShadCN UI + Framer Motion  
**Backend:** ⚙️ Node.js + Express + MongoDB (Atlas)  
**AI Integration:** 🤖 Google Gemini API for timetable optimization  
**Other Tools:**  
- Vite for blazing-fast dev environment  
- Lucide React for icons  
- CSV/Excel/PDF export utilities  

---

## 📂 Project Structure  
```
EduFlex/
├── backend/                 # Node.js backend services
│   ├── src/                 # Backend source code
│   ├── package.json         
│   └── Dockerfile           
│
├── src/                     # Frontend source code
│   ├── components/          
│   │   ├── ClassroomManager.tsx
│   │   ├── FacultyManager.tsx
│   │   ├── ScheduleOptimizer.tsx
│   │   ├── TimetableGrid.tsx
│   │   └── ui/              # ShadCN UI components
│   │
│   ├── pages/               # Feature Pages
│   │   ├── AnalyticsReports.tsx
│   │   ├── Dashboard.tsx
│   │   ├── FacultyManagement.tsx
│   │   ├── SmartScheduling.tsx
│   │   ├── TimetableGenerator.tsx
│   │   └── WorkflowManagement.tsx
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/                  # Static assets
├── package.json
├── tailwind.config.ts
└── README.md
```

---

## 📊 Expected Impact  
- ⏳ **80% reduction in timetable preparation time**  
- ✅ **Zero scheduling conflicts** with AI-powered conflict detection  
- 📈 **Maximized utilization** of classrooms and labs  
- ⚖️ **Balanced workload** for faculty  
- 😊 **Happier students & faculty** with fair and flexible schedules  

---

## 🖥️ Installation & Setup  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/your-username/EduFlex.git
cd EduFlex
```

### 2️⃣ Install Dependencies  
```bash
npm install   # or yarn install / bun install
```

### 3️⃣ Setup Environment Variables  
Create a `.env` file in the **root** and add your Gemini API key:  
```
VITE_GEMINI_API_KEY=your_api_key_here
MONGO_URI=your_mongodb_connection
PORT=5000
```

### 4️⃣ Run the Project  
```bash
npm run dev
```

---

## 🌍 Future Enhancements  
🚧 Integration with **Google Calendar & Outlook** for syncing schedules  
🚧 **Mobile app** for students to view updated timetables in real-time  
🚧 Predictive analysis for **faculty workload trends**  
🚧 **Voice AI Assistant** for querying schedules  

---

## 🤝 Contribution  
We welcome contributions! 🎉  
- Fork the repo  
- Create a feature branch (`git checkout -b feature-new`)  
- Commit changes & raise PR  

---

## 📜 License  
MIT License © 2025 — EduFlex Team  

---

🔥 With **EduFlex**, colleges can finally say goodbye to chaotic timetables and hello to **intelligent, adaptive, and student-friendly schedules**.  
