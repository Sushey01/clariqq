import LabLayout from '@/features/lab/components/LabLayout';
import '@/features/teacher/styles/teacher.css';

export default function TeacherLayout({ children }) {
  return (
    <LabLayout>
      <div className="teacher-desk">{children}</div>
    </LabLayout>
  );
}
