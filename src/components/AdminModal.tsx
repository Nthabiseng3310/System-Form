import React, { useState, useEffect } from 'react';
import {
  Booking,
  BlockedSlot,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  getAllBlockedSlots,
  addBlockedSlot,
  removeBlockedSlot,
  OPERATING_SLOTS,
} from '../services/bookingStorage';
import {
  getLocalQuizResponses,
  getFunnelStats,
  QuizSubmissionRecord,
  FunnelStats,
} from '../services/quizService';
import { GoogleSheetsManager } from './GoogleSheetsManager';
import {
  Lock,
  X,
  CheckCircle,
  XCircle,
  Trash2,
  Calendar,
  Clock,
  Download,
  AlertTriangle,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  Check,
  FileSpreadsheet,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'bookings' | 'google-sheets' | 'quiz-leads' | 'block-slots';
}

const ADMIN_PASSWORD = 'nthabi'; // Simple password for studio owner

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, initialTab = 'bookings' }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Tabs: 'bookings' | 'google-sheets' | 'quiz-leads' | 'block-slots'
  const [activeTab, setActiveTab] = useState<'bookings' | 'google-sheets' | 'quiz-leads' | 'block-slots'>(initialTab);

  // Bookings list state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Blocked slots state
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [blockDate, setBlockDate] = useState('');
  const [blockAllDay, setBlockAllDay] = useState(true);
  const [blockStart, setBlockStart] = useState('08:00');
  const [blockEnd, setBlockEnd] = useState('12:00');
  const [blockReason, setBlockReason] = useState('Studio Closed / Holiday');

  // Quiz leads & Funnel state
  const [quizLeads, setQuizLeads] = useState<QuizSubmissionRecord[]>([]);
  const [funnelStats, setFunnelStats] = useState<FunnelStats>({ starts: 0, stepDropoff: {}, completions: 0 });

  const refreshData = () => {
    setBookings(getAllBookings());
    setBlockedSlots(getAllBlockedSlots());
    setQuizLeads(getLocalQuizResponses());
    setFunnelStats(getFunnelStats());
  };

  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      }
      refreshData();
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim().toLowerCase() === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(false);
      refreshData();
    } else {
      setAuthError(true);
    }
  };

  const handleStatusChange = (id: string, status: 'confirmed' | 'cancelled') => {
    updateBookingStatus(id, status);
    refreshData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      deleteBooking(id);
      refreshData();
    }
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockDate) {
      alert('Please select a date to block.');
      return;
    }
    addBlockedSlot(
      blockDate,
      blockAllDay,
      blockAllDay ? undefined : blockStart,
      blockAllDay ? undefined : blockEnd,
      blockReason
    );
    refreshData();
    setBlockDate('');
    setBlockReason('Studio Maintenance');
  };

  const handleRemoveBlock = (id: string) => {
    removeBlockedSlot(id);
    refreshData();
  };

  // Export Bookings to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Treatment', 'Duration', 'Price (ZAR)', 'Date', 'Start Time', 'End Time', 'Client Name', 'Phone', 'Email', 'Status', 'Notes'];
    const rows = bookings.map((b) => [
      b.id,
      `"${b.treatmentName}"`,
      b.durationLabel,
      b.priceZAR,
      b.date,
      b.startTime,
      b.endTime,
      `"${b.clientName}"`,
      `"${b.clientPhone}"`,
      b.clientEmail,
      b.status,
      `"${b.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nthabis_touch_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Quiz Leads to CSV
  const handleExportQuizCSV = () => {
    const headers = [
      'Timestamp',
      'First Name',
      'Mobile',
      'Email',
      'Preferred Contact',
      'Treatments Interested In',
      'Main Need',
      'Visit Frequency',
      'Occupation Status',
      'Job Title / Field of Study',
      'Area',
      'Suburb/City (Other)',
      'Gender',
      'Age Range',
      'Race',
      'Reward Code',
      'Spa Personality',
      'Consent Given',
      'Forwarded to Sheet',
    ];

    const rows = quizLeads.map((item) => {
      const p = item.payload;
      return [
        `"${p['Timestamp']}"`,
        `"${p['First Name']}"`,
        `"${p['Mobile']}"`,
        `"${p['Email']}"`,
        `"${p['Preferred Contact']}"`,
        `"${p['Treatments Interested In']}"`,
        `"${p['Main Need']}"`,
        `"${p['Visit Frequency']}"`,
        `"${p['Occupation Status']}"`,
        `"${p['Job Title / Field of Study']}"`,
        `"${p['Area']}"`,
        `"${p['Suburb/City (Other)']}"`,
        `"${p['Gender']}"`,
        `"${p['Age Range']}"`,
        `"${p['Race']}"`,
        `"${p['Reward Code']}"`,
        `"${p['Spa Personality']}"`,
        `"${p['Consent Given']}"`,
        `"${item.forwardedToSheet ? 'Yes' : 'Queued/Local'}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nthabis_touch_quiz_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (dateFilter && b.date !== dateFilter) return false;
    return true;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#E8DEC8] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-[#1C2E24] text-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h3 className="font-serif text-lg font-medium">
                Nthabi's Touch · Studio Admin Portal
              </h3>
              <p className="text-[11px] text-[#C5DDD0]">
                Private dashboard for appointments, quiz leads &amp; schedules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Authentication Gate */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto">
            <div className="w-14 h-14 rounded-full bg-[#1C2E24]/10 text-[#1C2E24] flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-[#1C2E24]" />
            </div>
            <h4
              className="text-xl sm:text-2xl font-serif text-[#1C2E24] mb-2"
              style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
            >
              Enter Owner Password
            </h4>
            <p className="text-xs text-[#6B5E55] mb-6">
              Enter the studio admin password to access reservations, client leads and schedule controls.
              <br />
              <span className="text-[11px] text-[#8C6D46] mt-1 inline-block">
                (Default Password: <strong>nthabi</strong>)
              </span>
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#D8CFC5] bg-[#FAF7F2] text-[#2E2824] focus:outline-none focus:border-[#1C2E24] text-center tracking-wider"
              />

              {authError && (
                <p className="text-xs text-red-600 font-medium">
                  Incorrect password. Please try again.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1C2E24] hover:bg-[#284133] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs */}
            <div className="px-6 pt-4 border-b border-[#E8DEC8] bg-[#FAF7F2] flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`px-3.5 py-2 text-xs font-medium rounded-t-xl transition-colors border-t border-x ${
                    activeTab === 'bookings'
                      ? 'bg-white text-[#1C2E24] border-[#E8DEC8] font-semibold'
                      : 'text-[#6B5E55] border-transparent hover:text-[#1C2E24]'
                  }`}
                >
                  Appointments ({bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('google-sheets')}
                  className={`px-3.5 py-2 text-xs font-medium rounded-t-xl transition-colors border-t border-x flex items-center gap-1.5 ${
                    activeTab === 'google-sheets'
                      ? 'bg-white text-[#0F9D58] border-[#E8DEC8] font-semibold'
                      : 'text-[#6B5E55] border-transparent hover:text-[#0F9D58]'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#0F9D58]" />
                  <span>Google Sheets Live</span>
                </button>
                <button
                  onClick={() => setActiveTab('quiz-leads')}
                  className={`px-3.5 py-2 text-xs font-medium rounded-t-xl transition-colors border-t border-x ${
                    activeTab === 'quiz-leads'
                      ? 'bg-white text-[#1C2E24] border-[#E8DEC8] font-semibold'
                      : 'text-[#6B5E55] border-transparent hover:text-[#1C2E24]'
                  }`}
                >
                  Quiz Leads &amp; Funnel ({quizLeads.length})
                </button>
                <button
                  onClick={() => setActiveTab('block-slots')}
                  className={`px-3.5 py-2 text-xs font-medium rounded-t-xl transition-colors border-t border-x ${
                    activeTab === 'block-slots'
                      ? 'bg-white text-[#1C2E24] border-[#E8DEC8] font-semibold'
                      : 'text-[#6B5E55] border-transparent hover:text-[#1C2E24]'
                  }`}
                >
                  Block Days &amp; Times ({blockedSlots.length})
                </button>
              </div>

              <div className="flex items-center gap-2 pb-2">
                {activeTab === 'bookings' && (
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 text-xs rounded-lg border border-[#D8CFC5] bg-white text-[#2E2824] hover:bg-[#F4EFEA] flex items-center gap-1.5 shadow-2xs"
                    title="Export appointments to CSV file"
                  >
                    <Download className="w-3.5 h-3.5 text-[#8C6D46]" />
                    <span>Export CSV</span>
                  </button>
                )}
                {activeTab === 'quiz-leads' && (
                  <button
                    onClick={handleExportQuizCSV}
                    className="px-3 py-1.5 text-xs rounded-lg border border-[#D8CFC5] bg-white text-[#2E2824] hover:bg-[#F4EFEA] flex items-center gap-1.5 shadow-2xs"
                    title="Export quiz leads to CSV file"
                  >
                    <Download className="w-3.5 h-3.5 text-[#8C6D46]" />
                    <span>Export Leads (CSV)</span>
                  </button>
                )}
              </div>
            </div>

            {/* TAB 1: BOOKINGS LIST */}
            {activeTab === 'bookings' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] p-3 rounded-2xl border border-[#E8DEC8] text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[#6B5E55] font-medium">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e: any) => setStatusFilter(e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none"
                    >
                      <option value="all">All Bookings</option>
                      <option value="confirmed">Confirmed Only</option>
                      <option value="cancelled">Cancelled Only</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#6B5E55] font-medium">Filter Date:</span>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-[#D8CFC5] bg-white text-[#2E2824] text-xs focus:outline-none"
                    />
                    {dateFilter && (
                      <button
                        onClick={() => setDateFilter('')}
                        className="text-[11px] text-[#8C6D46] underline hover:text-[#1C2E24]"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Table or Empty State */}
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12 text-[#8C7E74]">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No bookings found matching current filters.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBookings.map((b) => (
                      <div
                        key={b.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          b.status === 'cancelled'
                            ? 'bg-[#FBF8F6] border-[#E8DFD8] opacity-75'
                            : 'bg-white border-[#E8DEC8] hover:border-[#C5A880] shadow-2xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-serif text-base font-semibold text-[#1C2E24]">
                                {b.treatmentName}
                              </h5>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                                  b.status === 'confirmed'
                                    ? 'bg-[#E6F4EA] text-[#137333]'
                                    : 'bg-[#FCE8E6] text-[#C5221F]'
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#7A6D63] mt-0.5">
                              {b.durationLabel} · <strong>R{b.priceZAR.toLocaleString('en-ZA')}</strong> due at studio
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 self-end sm:self-auto">
                            {b.status !== 'confirmed' && (
                              <button
                                onClick={() => handleStatusChange(b.id, 'confirmed')}
                                className="px-2.5 py-1 text-xs rounded-lg bg-[#E6F4EA] text-[#137333] hover:bg-[#CEEAD6] font-medium flex items-center gap-1"
                                title="Confirm booking"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Confirm</span>
                              </button>
                            )}
                            {b.status !== 'cancelled' && (
                              <button
                                onClick={() => handleStatusChange(b.id, 'cancelled')}
                                className="px-2.5 py-1 text-xs rounded-lg bg-[#FCE8E6] text-[#C5221F] hover:bg-[#FAD2CF] font-medium flex items-center gap-1"
                                title="Cancel booking"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancel</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(b.id)}
                              className="p-1.5 text-[#8C7E74] hover:text-red-700 transition-colors"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#F0EAE2] text-xs text-[#5C5047]">
                          <div>
                            <span className="text-[#8C6D46] block text-[10px] uppercase">
                              Date &amp; Time
                            </span>
                            <span className="font-semibold text-[#1C2E24]">
                              {b.date} ({b.startTime} – {b.endTime})
                            </span>
                          </div>
                          <div>
                            <span className="text-[#8C6D46] block text-[10px] uppercase">
                              Guest Contact
                            </span>
                            <span>{b.clientName} · {b.clientPhone}</span>
                          </div>
                          <div>
                            <span className="text-[#8C6D46] block text-[10px] uppercase">
                              Email Address
                            </span>
                            <span className="truncate block">{b.clientEmail}</span>
                          </div>
                        </div>

                        {b.notes && (
                          <div className="mt-2 text-xs bg-[#FAF7F2] p-2 rounded-lg text-[#6B5E55]">
                            <strong>Notes:</strong> {b.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: GOOGLE SHEETS LIVE */}
            {activeTab === 'google-sheets' && (
              <div className="flex-1 overflow-y-auto p-6">
                <GoogleSheetsManager />
              </div>
            )}

            {/* TAB 3: QUIZ LEADS & FUNNEL */}
            {activeTab === 'quiz-leads' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Funnel Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DEC8]">
                    <span className="text-[11px] text-[#8C6D46] uppercase font-semibold block">
                      Quiz Starts
                    </span>
                    <span className="font-serif text-2xl font-bold text-[#1C2E24]">
                      {funnelStats.starts}
                    </span>
                    <p className="text-[10px] text-[#7A6D63] mt-0.5">
                      Visitors who clicked Question 1
                    </p>
                  </div>

                  <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DEC8]">
                    <span className="text-[11px] text-[#8C6D46] uppercase font-semibold block">
                      Completions &amp; Rewards
                    </span>
                    <span className="font-serif text-2xl font-bold text-[#1C2E24]">
                      {funnelStats.completions}
                    </span>
                    <p className="text-[10px] text-[#7A6D63] mt-0.5">
                      Unlocked 10% voucher code
                    </p>
                  </div>

                  <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DEC8]">
                    <span className="text-[11px] text-[#8C6D46] uppercase font-semibold block">
                      Completion Rate
                    </span>
                    <span className="font-serif text-2xl font-bold text-[#1C2E24]">
                      {funnelStats.starts > 0
                        ? `${Math.round((funnelStats.completions / funnelStats.starts) * 100)}%`
                        : '0%'}
                    </span>
                    <p className="text-[10px] text-[#7A6D63] mt-0.5">
                      Conversion to lead
                    </p>
                  </div>
                </div>

                {/* Question Drop-off Funnel visualization */}
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DEC8]">
                  <h5 className="text-xs uppercase tracking-wider text-[#8C6D46] font-semibold mb-3">
                    Funnel Drop-Off Tracker
                  </h5>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-center text-xs">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => {
                      const count = funnelStats.stepDropoff?.[step] || 0;
                      return (
                        <div key={step} className="bg-white p-2 rounded-xl border border-[#E5DDD4]">
                          <span className="text-[10px] text-[#8C6D46] block font-semibold">
                            Q{step}
                          </span>
                          <span className="font-mono text-sm font-bold text-[#1C2E24]">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Leads List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-xs uppercase tracking-wider text-[#8C6D46] font-semibold">
                      Client Profile Leads Captured ({quizLeads.length})
                    </h5>
                    <span className="text-[11px] text-[#8C6D46]">
                      Synced to Google Sheet &amp; Supabase Backup
                    </span>
                  </div>

                  {quizLeads.length === 0 ? (
                    <div className="text-center py-10 text-[#8C7E74]">
                      <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#D4AF37]" />
                      <p className="text-sm">No quiz leads captured yet. They will appear here immediately upon submission.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {quizLeads.map((item) => {
                        const p = item.payload;
                        return (
                          <div
                            key={item.id}
                            className="p-4 rounded-2xl bg-white border border-[#E8DEC8] hover:border-[#C5A880] shadow-2xs space-y-2.5"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h6 className="font-serif text-base font-semibold text-[#1C2E24]">
                                  {p['First Name']} · {p['Mobile']}
                                </h6>
                                <p className="text-xs text-[#7A6D63]">
                                  {p['Email']} · Preferred: <strong>{p['Preferred Contact']}</strong>
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg bg-[#FAF3EA] border border-[#E0D3C1] font-mono text-xs font-bold text-[#8C6D46]">
                                  {p['Reward Code']}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-[#E6F4EA] text-[#137333] font-medium flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>{item.forwardedToSheet ? 'Sheet Synced' : 'Saved'}</span>
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#F0EAE2] text-[11px] text-[#5C5047]">
                              <div>
                                <span className="text-[#8C6D46] block font-medium">Personality:</span>
                                <span className="font-semibold text-[#1C2E24]">{p['Spa Personality']}</span>
                              </div>
                              <div>
                                <span className="text-[#8C6D46] block font-medium">Main Need:</span>
                                <span>{p['Main Need']}</span>
                              </div>
                              <div>
                                <span className="text-[#8C6D46] block font-medium">Area &amp; Posture:</span>
                                <span>{p['Area']} ({p['Occupation Status']})</span>
                              </div>
                              <div>
                                <span className="text-[#8C6D46] block font-medium">Timestamp:</span>
                                <span>{p['Timestamp']}</span>
                              </div>
                            </div>

                            <div className="text-[11px] text-[#6B5E55] bg-[#FAF7F2] p-2 rounded-lg">
                              <strong>Treatments Interested In:</strong> {p['Treatments Interested In']}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: BLOCK OUT DAYS & TIMES */}
            {activeTab === 'block-slots' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Form to Block */}
                <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8DEC8]">
                  <h4
                    className="font-serif text-lg font-medium text-[#1C2E24] mb-1"
                    style={{ fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif" }}
                  >
                    Block Out Studio Days or Specific Hours
                  </h4>
                  <p className="text-xs text-[#6B5E55] mb-4">
                    Prevent online guests from booking on public holidays, personal leave, or during specific staff training hours.
                  </p>

                  <form onSubmit={handleAddBlock} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                          Date to Block *
                        </label>
                        <input
                          type="date"
                          required
                          value={blockDate}
                          onChange={(e) => setBlockDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                          Block Type
                        </label>
                        <select
                          value={blockAllDay ? 'allday' : 'partial'}
                          onChange={(e) => setBlockAllDay(e.target.value === 'allday')}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none"
                        >
                          <option value="allday">Entire Day (All Slots)</option>
                          <option value="partial">Specific Time Range</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                          Reason / Label
                        </label>
                        <input
                          type="text"
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          placeholder="e.g. Public Holiday, Deep Clean"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#D8CFC5] bg-white text-[#2E2824] focus:outline-none"
                        />
                      </div>
                    </div>

                    {!blockAllDay && (
                      <div className="flex items-center gap-3 pt-1">
                        <div>
                          <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                            Start Time
                          </label>
                          <select
                            value={blockStart}
                            onChange={(e) => setBlockStart(e.target.value)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-[#D8CFC5] bg-white text-[#2E2824]"
                          >
                            {OPERATING_SLOTS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        <span className="text-xs text-[#8C7E74] mt-5">to</span>
                        <div>
                          <label className="block text-xs font-medium text-[#4A3E37] mb-1">
                            End Time
                          </label>
                          <select
                            value={blockEnd}
                            onChange={(e) => setBlockEnd(e.target.value)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-[#D8CFC5] bg-white text-[#2E2824]"
                          >
                            {OPERATING_SLOTS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                            <option value="17:00">17:00 (Close)</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#1C2E24] hover:bg-[#284133] text-[#FAF7F2] text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                      <span>Apply Blocked Slot</span>
                    </button>
                  </form>
                </div>

                {/* List of Blocked Slots */}
                <div>
                  <h5 className="text-xs uppercase tracking-wider text-[#8C6D46] font-semibold mb-3">
                    Currently Blocked Dates &amp; Times
                  </h5>

                  {blockedSlots.length === 0 ? (
                    <p className="text-xs text-[#8C7E74] italic">
                      No manual blocks active. Operating schedule is open Monday to Saturday.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {blockedSlots.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-white rounded-xl border border-[#E8DEC8] flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-[#1C2E24] block">
                              {item.date} {item.allDay ? '· All Day' : `· ${item.startTime} to ${item.endTime}`}
                            </span>
                            <span className="text-[#8C6D46] text-[11px]">{item.reason}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveBlock(item.id)}
                            className="p-1.5 text-[#A19488] hover:text-red-700 transition-colors"
                            title="Remove block"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

