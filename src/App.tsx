import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Onboarding
import SplashScreen from './pages/onboarding/SplashScreen';
import SelectRoleScreen from './pages/onboarding/SelectRoleScreen';
import AuthScreen from './pages/onboarding/AuthScreen';
import ProfileSetupScreen from './pages/onboarding/ProfileSetupScreen';

// Student
import StudentDashboard from './pages/student/StudentDashboard';

// Learn Flow
import SubjectDetailScreen from './pages/student/learn/SubjectDetailScreen';
import ChapterListScreen from './pages/student/learn/ChapterListScreen';
import LessonViewerScreen from './pages/student/learn/LessonViewerScreen';

// Practice Flow
import QuizSessionScreen from './pages/student/practice/QuizSessionScreen';

// Progress
import ProgressSkillsScreen from './pages/student/progress/ProgressSkillsScreen';

// Calendar
import CalendarScreen from './pages/student/CalendarScreen';

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherCalendarScreen from './pages/teacher/TeacherCalendarScreen';

// Tools
import FactCheckScreen from './pages/student/tools/FactCheckScreen';
import CommunicationScreen from './pages/student/tools/CommunicationScreen';
import { NetworkStatus } from '@/components/ui/NetworkStatus';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';

function App() {
  useDeviceProfile(); // Initialize device profile detection

  return (
    <BrowserRouter>
      <NetworkStatus />
      <Routes>
        {/* Onboarding Routes */}
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/select-role" element={<SelectRoleScreen />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/profile-setup" element={<ProfileSetupScreen />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />

        {/* Learn Flow Routes */}
        <Route path="/student/learn/subject/:subjectName" element={<SubjectDetailScreen />} />
        <Route path="/student/learn/book/:bookId" element={<ChapterListScreen />} />
        <Route path="/student/learn/chapter/:chapterId" element={<LessonViewerScreen />} />

        {/* Practice Flow Routes */}
        <Route path="/student/practice/chapter/:chapterId" element={<QuizSessionScreen />} />

        {/* Progress Route */}
        <Route path="/student/progress" element={<ProgressSkillsScreen />} />

        {/* Tools Routes */}
        <Route path="/student/tools/fact-check" element={<FactCheckScreen />} />
        <Route path="/student/tools/communication" element={<CommunicationScreen />} />

        {/* Calendar Route */}
        <Route path="/student/calendar" element={<CalendarScreen />} />

        {/* Teacher Routes */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/calendar" element={<TeacherCalendarScreen />} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/splash" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
