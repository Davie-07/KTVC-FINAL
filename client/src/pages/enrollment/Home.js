import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';

const Home = () => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [applicationsRes, statsRes] = await Promise.all([
        axios.get('/api/enrollment/applications'),
        axios.get('/api/enrollment/stats')
      ]);

      setApplications(Array.isArray(applicationsRes.data) ? applicationsRes.data : []);
      setStats(statsRes.data || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Add stat cards */}
      </div>

      {/* Applications Table */}
      {applications.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full bg-white">
            <thead>
              <tr>
                {/* Add table headers */}
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application._id}>
                  {/* Add table row data */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4">No applications found</div>
      )}
    </div>
  );
};

export default Home;