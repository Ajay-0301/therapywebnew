import { useState, useEffect } from 'react';
import { getClients, getDeletedClients, getAppointments, getEarnings, saveEarnings, type Client, type DeletedClient, type Appointment, type Earning } from '../utils/store';
import '../styles/insights.css';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getDaysInMonth = (month: number, year: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export default function Insights() {
  const now = new Date();
  const [clients, setClients] = useState<Client[]>([]);
  const [deletedClients, setDeletedClients] = useState<DeletedClient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [earnDay, setEarnDay] = useState<string>('');
  const [earnAmount, setEarnAmount] = useState<string>('');
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [editingTotalEarnings, setEditingTotalEarnings] = useState(false);
  const [newTotalEarnings, setNewTotalEarnings] = useState<string>('');
  const maxDaysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const availableYears = Array.from({ length: 10 }, (_, i) => 2026 + i);

  useEffect(() => {
    setClients(getClients());
    setDeletedClients(getDeletedClients());
    setAppointments(getAppointments());
    setEarnings(getEarnings());
  }, []);

  // Calculate metrics for selected month
  
  // Filter clients added this month
  const clientsAddedThisMonth = clients.filter(c => {
    const createdDate = new Date(c.createdAt);
    return createdDate.getMonth() === selectedMonth && createdDate.getFullYear() === selectedYear;
  });
  
  // Clients deleted this month
  const clientsDeletedThisMonth = deletedClients.filter(dc => {
    const deletedDate = new Date(dc.deletedAt);
    return deletedDate.getMonth() === selectedMonth && deletedDate.getFullYear() === selectedYear;
  });
  
  // Month-wise metrics
  const activeClients = clientsAddedThisMonth.filter(c => c.status === 'active').length;
  const completedCases = clientsAddedThisMonth.filter(c => c.status === 'completed').length;
  const totalClients = clientsAddedThisMonth.length;
  const clientsAddedCount = clientsAddedThisMonth.length;
  
  // Breakdown of clients added this month
  const activeClientsAdded = clientsAddedThisMonth.filter(c => c.status === 'active').length;
  const completedClientsAdded = clientsAddedThisMonth.filter(c => c.status === 'completed').length;
  const deletedClientsAdded = clientsDeletedThisMonth.length;
  
  // Filter earnings for selected month
  const monthEarnings = earnings.filter(e => e.month === selectedMonth && e.year === selectedYear);
  const totalMonthEarnings = monthEarnings.reduce((sum, e) => sum + e.amount, 0);
  
  // Filter appointments for selected month
  const monthAppointments = appointments.filter(a => {
    const apptDate = new Date(a.dateTime);
    return apptDate.getMonth() === selectedMonth && apptDate.getFullYear() === selectedYear;
  });
  const scheduledSessions = monthAppointments.length;
  
  // Count follow-up sessions this month (orange color - followUpDate)
  const followUpSessionsThisMonth = clientsAddedThisMonth.reduce((sum, c) => {
    return sum + (c.sessionHistory?.filter(s => s.followUpDate).length || 0);
  }, 0);
  
  const totalSessions = scheduledSessions + followUpSessionsThisMonth;
  const upcomingAppointments = monthAppointments.filter(a => a.dateTime > Date.now()).length;

  // Handle edit total earnings
  const handleEditTotalEarnings = () => {
    setEditingTotalEarnings(true);
    setNewTotalEarnings(totalMonthEarnings.toFixed(2));
  };

  const handleSaveTotalEarnings = () => {
    const newTotal = parseFloat(newTotalEarnings);
    if (isNaN(newTotal) || newTotal < 0) return;
    
    // Calculate the difference
    const difference = newTotal - totalMonthEarnings;
    
    // If there are existing earnings, distribute proportionally. Otherwise create a day 1 entry
    if (monthEarnings.length > 0) {
      // Get the first earning and adjust it by the difference
      const updated = earnings.map(e => {
        if (e.day === monthEarnings[0].day && e.month === selectedMonth && e.year === selectedYear) {
          return { ...e, amount: e.amount + difference, timestamp: Date.now() };
        }
        return e;
      });
      setEarnings(updated);
      saveEarnings(updated);
    } else {
      // Create a new entry for day 1
      const newEarning: Earning = {
        id: Date.now().toString(),
        day: 1,
        month: selectedMonth,
        year: selectedYear,
        amount: newTotal,
        timestamp: Date.now()
      };
      const updated = [...earnings, newEarning];
      setEarnings(updated);
      saveEarnings(updated);
    }
    
    setEditingTotalEarnings(false);
    setNewTotalEarnings('');
  };

  // Get age distribution
  const getAgeDistribution = () => {
    const ages = clientsAddedThisMonth
      .filter(c => c.age && typeof c.age === 'number')
      .map(c => c.age as number);
    if (ages.length === 0) return { min: 0, max: 0, avg: 0 };
    const sorted = ages.sort((a, b) => a - b);
    const avg = Math.round(ages.reduce((a, b) => a + b, 0) / ages.length);
    return { min: sorted[0], max: sorted[sorted.length - 1], avg };
  };

  const getAgeRangeDistribution = () => {
    const ages = clientsAddedThisMonth
      .filter(c => c.age && typeof c.age === 'number')
      .map(c => c.age as number);
    
    const ranges = [
      { label: '0-10', min: 0, max: 10, count: 0 },
      { label: '11-20', min: 11, max: 20, count: 0 },
      { label: '21-30', min: 21, max: 30, count: 0 },
      { label: '31-40', min: 31, max: 40, count: 0 },
      { label: '41-50', min: 41, max: 50, count: 0 },
      { label: '51-60', min: 51, max: 60, count: 0 },
      { label: '60+', min: 60, max: 150, count: 0 }
    ];

    ages.forEach(age => {
      const range = ranges.find(r => age >= r.min && age <= r.max);
      if (range) range.count++;
    });

    return ranges.filter(r => r.count > 0);
  };

  const ageDistribution = getAgeDistribution();
  const ageRanges = getAgeRangeDistribution();
  const maxAgeCount = Math.max(...ageRanges.map(r => r.count), 1);

  // Handle earnings
  const handleAddEarning = () => {
    if (!earnDay || !earnAmount) return;
    
    const day = parseInt(earnDay, 10);
    if (day < 1 || day > maxDaysInMonth) return; // Validate day is within month
    
    const amount = parseFloat(earnAmount);
    
    // Check if earning for this day already exists
    const existingIndex = earnings.findIndex(
      e => e.day === day && e.month === selectedMonth && e.year === selectedYear
    );
    
    let updated;
    if (existingIndex >= 0) {
      // Update existing
      updated = [...earnings];
      updated[existingIndex] = {
        ...updated[existingIndex],
        amount,
        timestamp: Date.now()
      };
    } else {
      // Add new
      const newEarning: Earning = {
        id: Date.now().toString(),
        day,
        month: selectedMonth,
        year: selectedYear,
        amount,
        timestamp: Date.now()
      };
      updated = [...earnings, newEarning];
    }
    
    setEarnings(updated);
    saveEarnings(updated);
    setEarnDay('');
    setEarnAmount('');
  };

  const handleEditDay = (day: number) => {
    const earning = monthEarnings.find(e => e.day === day);
    if (earning) {
      setEditingDay(day);
      setEditAmount(earning.amount.toString());
    }
  };

  const handleSaveEdit = () => {
    if (editingDay === null || !editAmount) return;
    
    const amount = parseFloat(editAmount);
    const updated = earnings.map(e => {
      if (e.day === editingDay && e.month === selectedMonth && e.year === selectedYear) {
        return { ...e, amount, timestamp: Date.now() };
      }
      return e;
    });
    
    setEarnings(updated);
    saveEarnings(updated);
    setEditingDay(null);
    setEditAmount('');
  };

  const handleDeleteDay = (day: number) => {
    const updated = earnings.filter(
      e => !(e.day === day && e.month === selectedMonth && e.year === selectedYear)
    );
    setEarnings(updated);
    saveEarnings(updated);
    setEditingDay(null);
    setEditAmount('');
  };

  // Get earnings by day for visualization (only up to days in selected month)
  const earningsByDay = new Array(maxDaysInMonth).fill(0);
  monthEarnings.forEach(e => {
    if (e.day >= 1 && e.day <= maxDaysInMonth) {
      earningsByDay[e.day - 1] += e.amount;
    }
  });
  
  const maxEarning = Math.max(...earningsByDay, 1);

  return (
    <section className="page active">
      <div className="page-header">
        <div className="page-header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <div className="page-header-content">
          <h2>Insights</h2>
          <p className="page-subtitle">Analytics and progress tracking</p>
        </div>
      </div>

      {/* Month & Year Selector */}
      <div className="month-selector-container">
        <div className="selector-buttons">
          <button 
            className="month-selector-btn"
            onClick={() => {
              setShowMonthPicker(!showMonthPicker);
              setShowYearPicker(false);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {MONTH_NAMES[selectedMonth]}
          </button>

          <button 
            className="month-selector-btn"
            onClick={() => {
              setShowYearPicker(!showYearPicker);
              setShowMonthPicker(false);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
            {selectedYear}
          </button>
        </div>
        
        {showMonthPicker && (
          <div className="month-picker-dropdown">
            <div className="month-grid">
              {MONTH_NAMES.map((month, index) => (
                <button
                  key={month}
                  className={`month-item ${index === selectedMonth ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedMonth(index);
                    setShowMonthPicker(false);
                    setEarnDay('');
                    setEditingDay(null);
                  }}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}

        {showYearPicker && (
          <div className="year-picker-dropdown">
            <div className="year-grid">
              {availableYears.map((year) => (
                <button
                  key={year}
                  className={`year-item ${year === selectedYear ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                    setEarnDay('');
                    setEditingDay(null);
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards - ONLY CENTER SECTION */}
      <div className="insights-summary">
        <div className="summary-card">
          <div className="summary-header">
            <h3>Client Overview</h3>
            <span className="summary-badge">{totalClients} Total</span>
          </div>
          <div className="summary-content">
            <div className="summary-stat">
              <span className="summary-label">Active</span>
              <span className="summary-number">{activeClients}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-stat">
              <span className="summary-label">Completed</span>
              <span className="summary-number">{completedCases}</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-header">
            <h3>Session Activity</h3>
            <span className="summary-badge">This Month</span>
          </div>
          <div className="summary-content">
            <div className="summary-stat">
              <span className="summary-label">Scheduled</span>
              <span className="summary-number">{scheduledSessions}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-stat">
              <span className="summary-label">Total</span>
              <span className="summary-number">{totalSessions}</span>
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-header">
            <h3>Client Age Range</h3>
            <span className="summary-badge">Average: {ageDistribution.avg}</span>
          </div>
          <div className="summary-content">
            <div className="summary-stat">
              <span className="summary-label">Youngest</span>
              <span className="summary-number">{ageDistribution.min || '—'}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-stat">
              <span className="summary-label">Oldest</span>
              <span className="summary-number">{ageDistribution.max || '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Visualization Section */}
      <div className="visualization-section">
        <h3 className="visualization-title">Data Visualization</h3>
        <div className="visualization-grid">
          {/* Client Status Distribution */}
          <div className="viz-card">
            <div className="viz-header">
              <h4>Client Status</h4>
              <p className="viz-subtitle">Active vs Completed</p>
            </div>
            <div className="viz-chart">
              <div className="pie-chart">
                <svg viewBox="0 0 100 100" className="pie" style={{ 
                  background: `conic-gradient(#667eea 0% ${(activeClients / totalClients) * 100}%, #10b981 ${(activeClients / totalClients) * 100}% 100%)`
                }}>
                  <circle cx="50" cy="50" r="30" fill="white" />
                </svg>
              </div>
              <div className="pie-legend">
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#667eea' }}></span>
                  <span>Active: {activeClients}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot" style={{ background: '#10b981' }}></span>
                  <span>Completed: {completedCases}</span>
                </div>
              </div>
            </div>
            <div className="client-status-summary">
              <div className="status-item">
                <span className="status-label">Active Clients</span>
                <span className="status-value" style={{ color: '#667eea' }}>{activeClients}</span>
              </div>
              <div className="status-divider"></div>
              <div className="status-item">
                <span className="status-label">Completed Cases</span>
                <span className="status-value" style={{ color: '#10b981' }}>{completedCases}</span>
              </div>
              <div className="status-divider"></div>
              <div className="status-item">
                <span className="status-label">Total Clients</span>
                <span className="status-value" style={{ color: '#667eea' }}>{totalClients}</span>
              </div>
            </div>
          </div>

          {/* Session Completion Rate */}
          <div className="viz-card">
            <div className="viz-header">
              <h4>Monthly Earnings</h4>
              <p className="viz-subtitle">Track daily income</p>
            </div>
            <div className="earnings-form">
              <div className="earnings-form-row">
                <div className="form-group">
                  <label>Day</label>
                  <input 
                    type="number" 
                    min="1" 
                    max={maxDaysInMonth}
                    value={earnDay}
                    onChange={(e) => setEarnDay(e.target.value)}
                    placeholder={`1-${maxDaysInMonth}`}
                  />
                </div>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input 
                    type="number" 
                    value={earnAmount}
                    onChange={(e) => setEarnAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <button className="add-btn" onClick={handleAddEarning}>+ Add</button>
              </div>
            </div>
            <div className="earnings-summary">
              <div className="summary-stat">
                <span className="summary-label">Total This Month</span>
                <span 
                  className="summary-value editable-value"
                  onClick={handleEditTotalEarnings}
                  title="Click to edit"
                >
                  ₹{totalMonthEarnings.toFixed(2)}
                </span>
              </div>
            </div>

            {editingTotalEarnings && (
              <div className="earnings-edit-modal">
                <div className="earnings-edit-content">
                  <div className="edit-header">
                    <h4>Edit Total Earnings</h4>
                    <button className="close-btn" onClick={() => setEditingTotalEarnings(false)}>✕</button>
                  </div>
                  <div className="edit-body">
                    <label>Total Amount (₹)</label>
                    <input 
                      type="number" 
                      value={newTotalEarnings}
                      onChange={(e) => setNewTotalEarnings(e.target.value)}
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                  <div className="edit-footer">
                    <button className="btn-save" onClick={handleSaveTotalEarnings}>Save</button>
                    <button className="btn-cancel" onClick={() => setEditingTotalEarnings(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <div className="earnings-chart">
              {editingDay !== null && (
                <div className="earnings-edit-modal">
                  <div className="earnings-edit-content">
                    <div className="edit-header">
                      <h4>Edit Day {editingDay}</h4>
                      <button className="close-btn" onClick={() => setEditingDay(null)}>✕</button>
                    </div>
                    <div className="edit-body">
                      <label>Amount (₹)</label>
                      <input 
                        type="number" 
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        placeholder="0.00"
                      />
                      <div className="edit-actions">
                        <button className="btn-save" onClick={handleSaveEdit}>Save</button>
                        <button className="btn-delete" onClick={() => handleDeleteDay(editingDay)}>Delete</button>
                        <button className="btn-cancel" onClick={() => setEditingDay(null)}>Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="earnings-bars">
                {earningsByDay.map((amount, idx) => (
                  <div 
                    key={idx} 
                    className={`earnings-bar-item ${editingDay === idx + 1 ? 'editing' : ''}`}
                    onClick={() => amount > 0 && handleEditDay(idx + 1)}
                  >
                    {amount > 0 && <div className="earnings-bar-value">₹{amount.toFixed(0)}</div>}
                    <div 
                      className="earnings-bar" 
                      style={{ height: `${amount > 0 ? (amount / (maxEarning || 1)) * 150 : 4}px` }}
                      title={amount > 0 ? `Click to edit - Day ${idx + 1}: ₹${amount}` : ''}
                    >
                      <span className="earnings-tooltip">Day {idx + 1}: ₹{amount}</span>
                    </div>
                    <div className="earnings-bar-day">{idx + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Sessions Trend */}
          <div className="viz-card">
            <div className="viz-header">
              <h4>Sessions and Follow-up This Month</h4>
              <p className="viz-subtitle">Activity breakdown</p>
            </div>
            <div className="viz-chart">
              <div className="bar-chart">
                <div className="bar-item">
                  <span className="bar-value">{scheduledSessions}</span>
                  <div className="bar" style={{ height: `${(scheduledSessions / Math.max(totalSessions, 10)) * 100}%` }}></div>
                  <span className="bar-label">Scheduled</span>
                </div>
                <div className="bar-item">
                  <span className="bar-value">{followUpSessionsThisMonth}</span>
                  <div className="bar" style={{ height: `${(followUpSessionsThisMonth / Math.max(totalSessions, 10)) * 100}%` }}></div>
                  <span className="bar-label">Follow-up</span>
                </div>
                <div className="bar-item">
                  <span className="bar-value">{totalSessions}</span>
                  <div className="bar" style={{ height: `${(totalSessions / Math.max(totalSessions, 10)) * 100}%` }}></div>
                  <span className="bar-label">Total</span>
                </div>
              </div>
            </div>
            <div className="sessions-summary-section">
              <div className="summary-item">
                <span className="summary-item-label">Scheduled</span>
                <span className="summary-item-value">{scheduledSessions}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item-label">Follow-ups</span>
                <span className="summary-item-value">{followUpSessionsThisMonth}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item-label">Total</span>
                <span className="summary-item-value">{totalSessions}</span>
              </div>
            </div>
          </div>

          {/* Age Distribution */}
          <div className="viz-card">
            <div className="viz-header">
              <h4>Age Statistics</h4>
              <p className="viz-subtitle">Client demographics</p>
            </div>
            <div className="viz-chart">
              <div className="age-chart">
                {ageRanges.length > 0 ? (
                  <div className="age-bar-chart">
                    <div className="age-bars-container">
                      {ageRanges.map(range => (
                        <div key={range.label} className="age-bar-wrapper">
                          <div 
                            className="age-bar-vertical" 
                            style={{ 
                              height: `${(range.count / maxAgeCount) * 100}%`,
                              background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)'
                            }}
                            title={`${range.label}: ${range.count} client${range.count !== 1 ? 's' : ''}`}
                          >
                            <span className="age-bar-value">{range.count}</span>
                          </div>
                          <span className="age-bar-label">{range.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="stats-display">
                    <div className="stat-row">
                      <span className="stat-label">Average Age</span>
                      <span className="stat-value-lg">{ageDistribution.avg}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Age Range</span>
                      <span className="stat-value">{ageDistribution.min || '—'} - {ageDistribution.max || '—'}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Total Clients</span>
                      <span className="stat-value">{totalClients}</span>
                    </div>
                  </div>
                )}
              </div>
              {ageRanges.length > 0 && (
                <div className="age-stats-summary">
                  <div className="stat-item">
                    <span className="stat-label">Average Age</span>
                    <span className="stat-value-lg">{ageDistribution.avg}</span>
                  </div>
                  <div className="age-divider"></div>
                  <div className="stat-item">
                    <span className="stat-label">Range</span>
                    <span className="stat-value">{ageDistribution.min} - {ageDistribution.max}</span>
                  </div>
                  <div className="age-divider"></div>
                  <div className="stat-item">
                    <span className="stat-label">Total</span>
                    <span className="stat-value-lg">{totalClients}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Clients Added This Month */}
          <div className="viz-card">
            <div className="viz-header">
              <h4>Clients Added</h4>
              <p className="viz-subtitle">New clients this month</p>
            </div>
            <div className="viz-chart">
              <div className="clients-added-container">
                <div className="clients-added-circle">
                  <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="50" 
                      fill="none" 
                      stroke="#f0f4ff" 
                      strokeWidth="8"
                    />
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="50" 
                      fill="none" 
                      stroke="url(#clients-gradient)" 
                      strokeWidth="8"
                      strokeDasharray={`${(clientsAddedCount / Math.max(totalClients, 1)) * 314} 314`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.3s ease' }}
                    />
                    <defs>
                      <linearGradient id="clients-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="clients-added-number">{clientsAddedCount}</div>
                </div>
                <div className="clients-added-stats">
                  <div className="stat-row">
                    <span className="stat-label">Active Added</span>
                    <span className="stat-value">{activeClientsAdded}</span>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-row">
                    <span className="stat-label">Completed Added</span>
                    <span className="stat-value">{completedClientsAdded}</span>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-row">
                    <span className="stat-label">Deleted Added</span>
                    <span className="stat-value">{deletedClientsAdded}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
