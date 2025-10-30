import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';

const Home = () => {
  const [stats, setStats] = useState({
    totalCollected: 0,
    todayCollected: 0,
    pendingPayments: 0,
    totalStudents: 0
  });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, paymentsRes] = await Promise.all([
          axios.get('/api/finance/stats'),
          axios.get('/api/finance/payments')
        ]);

        setStats(statsRes.data || {
          totalCollected: 0,
          todayCollected: 0,
          pendingPayments: 0,
          totalStudents: 0
        });
        
        setPayments(Array.isArray(paymentsRes.data) ? paymentsRes.data : []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Total Collections</h3>
          <p className="text-2xl font-bold">KES {stats.totalCollected.toLocaleString()}</p>
        </div>
        {/* Add more stat cards */}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          {payments.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment._id}>
                    <td className="px-6 py-4">{payment.student?.name || 'N/A'}</td>
                    <td className="px-6 py-4">KES {payment.amount?.toLocaleString()}</td>
                    <td className="px-6 py-4">{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{payment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-4 text-gray-500">No payments found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
