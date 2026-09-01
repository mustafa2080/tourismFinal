import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Usage: Add "Book Now" button to Package Detail Page
 * This component demonstrates how to integrate the new BookingPage
 */

// In PackageDetailPage.jsx or similar component:

const PackageDetailPage = () => {
  const navigate = useNavigate();
  const { packageId } = useParams();
  const [packageData, setPackageData] = useState(null);

  // ... existing code ...

  const handleBookNow = () => {
    // Navigate to booking page with package ID
    navigate(`/booking/${packageId}`);
  };

  return (
    <div>
      {/* Package details content */}
      
      {/* Call-to-action button */}
      <div className="cta-section">
        <button 
          onClick={handleBookNow}
          className="btn btn-primary btn-lg"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default PackageDetailPage;


// ============================================
// ROUTE SETUP (in your router configuration)
// ============================================

// In AppRoutes.jsx or your routing file:

import BookingPage from './pages/BookingPage';

// Add this route:
{
  path: '/booking/:packageId',
  element: <BookingPage />,
  meta: { requiresAuth: true } // Optional: require authentication
}

// Or if using simple routing:
<Route path="/booking/:packageId" element={<BookingPage />} />


// ============================================
// INTEGRATION WITH EXISTING PACKAGES LIST
// ============================================

// In SearchPage or PackagesGrid component:

const PackageCard = ({ package: pkg }) => {
  const navigate = useNavigate();

  return (
    <div className="package-card">
      {/* Package image, title, description, etc */}
      
      <button 
        onClick={() => navigate(`/booking/${pkg.id}`)}
        className="btn btn-primary"
      >
        Book Now →
      </button>
    </div>
  );
};
