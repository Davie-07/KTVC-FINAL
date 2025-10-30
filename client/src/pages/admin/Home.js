import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';

const Home = () => {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 0,
    payments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard-stats');
      setStats(response.data || {
        students: 0,
        teachers: 0,
        courses: 0,
        payments: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      {/* Dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3>Total Students</h3>
          <p className="text-2xl font-bold">{stats.students}</p>
        </div>
        {/* Add more stat cards */}
      </div>
    </div>
  );
};

export default Home;
