import LabLayout from '@/features/lab/components/LabLayout';

export default function ParentLayout({ children }) {
  return (
    <LabLayout>
      <div className="teacher-desk">{children}</div>
    </LabLayout>
  );
}
