import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';

const Home = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCollected: 0,
    pendingPayments: 0,
    totalStudents: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, statsRes] = await Promise.all([
        axios.get('/api/finance/payments'),
        axios.get('/api/finance/stats')
      ]);

      setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
      setStats(statsRes.data || {
        totalCollected: 0,
        pendingPayments: 0,
        totalStudents: 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Add stat cards */}
      </div>

      {/* Payments Table */}
      {payments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full bg-white">
            <thead>
              <tr>
                {/* Add table headers */}
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id}>
                  {/* Add table row data */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4">No payments found</div>
      )}
    </div>
  );
};

export default Home;
