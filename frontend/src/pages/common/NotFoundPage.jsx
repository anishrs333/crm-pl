import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Home } from 'lucide-react';
import './NotFoundPage.css';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-code">404</div>
      <h2 className="not-found-title">Page Not Found</h2>
      <p className="not-found-desc">
        The CRM page you are looking for does not exist or may have been moved.
      </p>
      <Button
        variant="primary"
        icon={Home}
        onClick={() => navigate('/dashboard')}
      >
        Back to Dashboard
      </Button>
    </div>
  );
};
