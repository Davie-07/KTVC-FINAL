import React, { useState, useEffect } from 'react';
import axios from '../../services/axios';
import { DollarSign, Users, Clock, AlertCircle } from 'lucide-react';
import { ensureArray } from '../../utils/normalizeResponse';

const Home = () => {
  const [stats, setStats] = useState({
    totalCollected: 0,
    todayCollected: 0,
    pendingPayments: 0,
    totalStudents: 0,
    paidCount: 0,
    partialCount: 0,
    unpaidCount: 0,
    totalExpected: 0
  });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Local fallback normalizer (covers more shapes and iterables)
  const normalizeArrayLocal = (raw) => {
    if (Array.isArray(raw)) return raw;
    if (!raw) return [];
    if (typeof raw === 'object') {
      // try known keys
      const keys = ['payments', 'data', 'items', 'results', 'rows', 'users'];
      for (const k of keys) if (Array.isArray(raw[k])) return raw[k];
      // handle paginated shape { data: { items: [...] } }
      if (raw.data && typeof raw.data === 'object') {
        for (const k of keys) if (Array.isArray(raw.data[k])) return raw.data[k];
      }
      // if it's an iterable (e.g., Set), convert to array
      if (typeof raw[Symbol.iterator] === 'function') {
        try { return Array.from(raw); } catch (_) {}
      }
    }
    return [];
  };

  useEffect(() => {
    const looksLikeStudentsArray = (arr) => {
      if (!Array.isArray(arr) || arr.length === 0) return false;
      // If most items have admissionNumber or course and DON'T have amount or receiptNumber, it's likely students
      let studentLike = 0;
      let paymentLike = 0;
      for (const it of arr.slice(0, 10)) { // sample up to first 10
        const hasAdmission = !!(it && (it.admissionNumber || it.admission_no || it.admission));
        const hasAmount = !!(it && (it.amount || it.totalAmount || it.payments));
        const hasReceipt = !!(it && (it.receiptNumber || it.receipt_no));
        if (hasAdmission && !hasAmount && !hasReceipt) studentLike++;
        if (hasAmount || hasReceipt) paymentLike++;
      }
      // If majority look like students, treat as students array
      return studentLike > paymentLike;
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, paymentsRes] = await Promise.all([
          axios.get('/api/finance/dashboard'),
          axios.get('/api/finance/payments')
        ]);

        // DEBUG: log raw responses (copy-paste this JSON if issue persists)
        console.debug('DEBUG /api/finance/dashboard response (type, sample):', typeof statsRes?.data, statsRes?.data && Object.keys(statsRes.data).slice(0,5));
        console.debug('DEBUG /api/finance/payments response (type, sample):', typeof paymentsRes?.data, Array.isArray(paymentsRes?.data) ? `array length ${paymentsRes.data.length}` : Object.keys(paymentsRes?.data || {}).slice(0,5));

        const s = statsRes?.data || {};
        setStats({
          totalCollected: Number(s.totalCollected) || 0,
          todayCollected: Number(s.todayCollected) || 0,
          pendingPayments: Number(s.pendingPayments) || 0,
          totalStudents: Number(s.totalStudents) || 0,
          paidCount: Number(s.paidCount) || 0,
          partialCount: Number(s.partialCount) || 0,
          unpaidCount: Number(s.unpaidCount) || 0,
          totalExpected: Number(s.totalExpected) || 0
        });

        // Normalize payments using shared helper
        const paymentsData = ensureArray(paymentsRes?.data);

        // Additional safety: if paymentsData looks like a students array, do not use as payments
        if (Array.isArray(paymentsData) && paymentsData.length > 0 && looksLikeStudentsArray(paymentsData)) {
          console.warn('Finance payments endpoint returned a STUDENTS array — treating as no payments. Sample item:', paymentsData[0]);
          setPayments([]); // avoid calling .map/.filter on wrong shape
        } else {
          // If paymentsData is empty but paymentsRes.data contains nested array under other keys, ensureArray should handle that.
          // Log if data exists but normalized result is empty, so you can paste the response here.
          if ((!Array.isArray(paymentsData) || paymentsData.length === 0) && paymentsRes?.data) {
            console.warn('Finance payments endpoint returned unexpected shape (normalized to empty array):', paymentsRes.data);
          }
          setPayments(Array.isArray(paymentsData) ? paymentsData : []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred');
        setStats({
          totalCollected: 0,
          todayCollected: 0,
          pendingPayments: 0,
          totalStudents: 0,
          paidCount: 0,
          partialCount: 0,
          unpaidCount: 0,
          totalExpected: 0
        });
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Ensure payments is a pure array before any array operations
  const safePayments = Array.isArray(payments) ? payments : [];

  // Precompute rows inside try/catch to avoid runtime crash when rendering
  let paymentsRows = [];
  try {
    paymentsRows = safePayments.map((payment) => (
      <tr key={payment._id}>
        <td className="px-6 py-4">{payment.student?.name || 'N/A'}</td>
        <td className="px-6 py-4">KES {payment.amount?.toLocaleString()}</td>
        <td className="px-6 py-4">{payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}</td>
        <td className="px-6 py-4">{payment.status || 'N/A'}</td>
      </tr>
    ));
  } catch (e) {
    // Log full object for debugging without changing UI
    console.error('Error while building payments rows:', e, 'payments value:', payments);
    paymentsRows = []; // graceful fallback
  }

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm">Total Collections</h3>
            <DollarSign className="text-green-500" size={20} />
          </div>
          <p className="text-2xl font-bold">KES {stats.totalCollected.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Expected: KES {stats.totalExpected.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm">Today's Collections</h3>
            <Clock className="text-blue-500" size={20} />
          </div>
          <p className="text-2xl font-bold">KES {stats.todayCollected.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm">Pending Payments</h3>
            <AlertCircle className="text-orange-500" size={20} />
          </div>
          <p className="text-2xl font-bold">{stats.pendingPayments}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm">Total Students</h3>
            <Users className="text-purple-500" size={20} />
          </div>
          <p className="text-2xl font-bold">{stats.totalStudents}</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          {paymentsRows.length > 0 ? (
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
                {paymentsRows}
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
