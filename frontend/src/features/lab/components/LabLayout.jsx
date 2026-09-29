import '@/features/lab/styles/lab.css';
import LabNav from '@/features/lab/components/LabNav';

export default function LabLayout({ children }) {
  return (
    <div className="nebular">
      <LabNav />
      {children}
    </div>
  );
}
