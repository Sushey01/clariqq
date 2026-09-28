import { Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';

export default function NebularNav() {
  const { user } = useAuth();
  const chatTo = user ? '/app/chat' : '/demo';

  return (
    <header className="nebular-nav">
      <Link to="/" className="nebular-brand">
        <span className="nebular-brand-mark">
          <FlaskConical size={16} />
        </span>
        Clariq
      </Link>
      <nav className="nebular-links">
        <a href="/#benches">Lab</a>
        <a href="/#tutor-preview">Tutor</a>
        <a href="/#signals">Progress</a>
        <Link to={chatTo}>Chat</Link>
      </nav>
      <div className="flex items-center gap-2">
        <Link to={chatTo} className="nebular-preview-btn sm:hidden">
          Chat
        </Link>
        <Link to="/preview" className="nebular-preview-btn">
          Preview
        </Link>
      </div>
    </header>
  );
}

