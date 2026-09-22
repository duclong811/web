import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

/**
 * Component lắng nghe sự thay đổi Route của React Router
 * và tự động gửi sự kiện page_view về Google Analytics 4 (SPA Tracking)
 */
export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    const pagePath = location.pathname + location.search;
    trackPageView(pagePath, document.title);
  }, [location]);

  return null;
}
