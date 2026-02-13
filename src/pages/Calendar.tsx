import { useState, useEffect, useMemo } from 'react';
import {
  getAppointments,
  saveAppointments,
  getClients,
  type Appointment,
  type Client,
} from '../utils/store';
import '../styles/calendar.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Light orange/amber color for all appointments
const APPOINTMENT_COLOR = { bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b', text: '#b45309' };

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

export default function Calendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('10:00');
  const [formDuration, setFormDuration] = useState('60');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setAppointments(getAppointments());
    setClients(getClients());
  }, []);

  // Calendar grid data
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const days: (Date | null)[] = [];

    // Previous month padding
    for (let i = 0; i < startPad; i++) {
      days.push(null);
    }
    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    // Next month padding to complete the grid
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    return days;
  }, [currentDate]);

  // Map appointments to dates
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((appt) => {
      const d = new Date(appt.dateTime);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(appt);
    });
    // Sort each day's appointments by time
    map.forEach((appts) => appts.sort((a, b) => a.dateTime - b.dateTime));
    return map;
  }, [appointments]);

  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  function openNewSession() {
    setFormName('');
    setFormAge('');
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    setFormDate(`${year}-${month}-${date}`);
    setFormTime('10:00');
    setFormDuration('60');
    setFormError('');
    setSelectedDay(null);
    setShowModal(true);
  }

  function openNewSessionOnDay(day: Date) {
    setFormName('');
    setFormAge('');
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const date = String(day.getDate()).padStart(2, '0');
    setFormDate(`${year}-${month}-${date}`);
    setFormTime('10:00');
    setFormDuration('60');
    setFormError('');
    setSelectedDay(day);
    setShowModal(true);
  }

  function handleCreateSession(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Client name is required');
      return;
    }
    if (!formDate) {
      setFormError('Appointment date is required');
      return;
    }
    if (!formTime) {
      setFormError('Appointment time is required');
      return;
    }

    const [hours, minutes] = formTime.split(':').map(Number);
    const dateObj = new Date(formDate);
    dateObj.setHours(hours, minutes, 0, 0);

    const newAppt: Appointment = {
      id: `appt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      clientName: formName.trim(),
      clientAge: formAge ? parseInt(formAge, 10) : undefined,
      dateTime: dateObj.getTime(),
      duration: parseInt(formDuration, 10) || 60,
    };

    const updated = [...appointments, newAppt];
    saveAppointments(updated);
    setAppointments(updated);
    setShowModal(false);
  }

  function deleteAppointment(id: string) {
    const updated = appointments.filter((a) => a.id !== id);
    saveAppointments(updated);
    setAppointments(updated);
  }

  const today = new Date();
  const todayAppts = appointments
    .filter((a) => isSameDay(new Date(a.dateTime), today))
    .sort((a, b) => a.dateTime - b.dateTime);

  // Client name suggestions
  const clientNames = clients.map((c) => c.name);

  // Selected day appointments for the detail panel
  const selectedDayKey = selectedDay
    ? `${selectedDay.getFullYear()}-${selectedDay.getMonth()}-${selectedDay.getDate()}`
    : null;
  const selectedDayAppts = selectedDayKey ? (appointmentsByDate.get(selectedDayKey) || []) : [];

  return (
    <section className="page active">
      <div className="page-header">
        <div>
          <h2>Calendar</h2>
          <p className="page-subtitle">Manage your sessions and appointments</p>
        </div>
        <button className="btn btn-primary new-session-btn" onClick={openNewSession}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Session
        </button>
      </div>

      <div className="calendar-layout">
        {/* Main Calendar */}
        <div className="calendar-main">
          <div className="calendar-nav">
            <button className="cal-nav-btn" onClick={prevMonth} title="Previous month">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="cal-nav-center">
              <h3 className="cal-month-title">
                {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button className="cal-today-btn" onClick={goToToday}>Today</button>
            </div>
            <button className="cal-nav-btn" onClick={nextMonth} title="Next month">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          </div>

          <div className="calendar-grid">
            {/* Weekday headers */}
            {WEEKDAYS.map((day) => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
            {/* Day cells */}
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`pad-${idx}`} className="calendar-day empty" />;

              const dateKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
              const dayAppts = appointmentsByDate.get(dateKey) || [];
              const isToday = isSameDay(day, today);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isSelected = selectedDay && isSameDay(day, selectedDay);

              return (
                <div
                  key={dateKey}
                  className={`calendar-day${isToday ? ' today' : ''}${!isCurrentMonth ? ' other-month' : ''}${isSelected ? ' selected' : ''}${dayAppts.length > 0 ? ' has-events' : ''}`}
                  onClick={() => {
                    setSelectedDay(day);
                  }}
                  onDoubleClick={() => openNewSessionOnDay(day)}
                >
                  <span className="day-number">{day.getDate()}</span>
                  <div className="day-events">
                    {dayAppts.slice(0, 3).map((appt) => {
                      const color = APPOINTMENT_COLOR;
                      return (
                        <div
                          key={appt.id}
                          className="day-event"
                          style={{
                            background: color.bg,
                            borderLeft: `3px solid ${color.border}`,
                            color: color.text,
                          }}
                        >
                          <span className="event-time">{formatTime(new Date(appt.dateTime))}</span>
                          <span className="event-name">{appt.clientName}</span>
                        </div>
                      );
                    })}
                    {dayAppts.length > 3 && (
                      <div className="day-event-more">+{dayAppts.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="calendar-sidebar">
          {selectedDay ? (
            <>
              <div className="cal-sidebar-header">
                <h4>
                  {selectedDay.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </h4>
                <button className="cal-sidebar-add" onClick={() => openNewSessionOnDay(selectedDay)} title="Add session">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
              {selectedDayAppts.length === 0 ? (
                <div className="cal-sidebar-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.25}>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <p>No sessions scheduled</p>
                  <button className="btn btn-secondary cal-sidebar-new" onClick={() => openNewSessionOnDay(selectedDay)}>
                    Schedule a Session
                  </button>
                </div>
              ) : (
                <div className="cal-sidebar-list">
                  {selectedDayAppts.map((appt) => {
                    const color = APPOINTMENT_COLOR;
                    const startTime = new Date(appt.dateTime);
                    const endTime = new Date(appt.dateTime + (appt.duration || 60) * 60000);
                    return (
                      <div key={appt.id} className="cal-sidebar-item" style={{ borderLeft: `4px solid ${color.border}` }}>
                        <div className="cal-sidebar-item-header">
                          <div className="cal-sidebar-item-avatar" style={{ background: color.border }}>
                            {appt.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div className="cal-sidebar-item-info">
                            <h5>{appt.clientName}</h5>
                            {appt.clientAge && <span className="cal-sidebar-item-age">Age {appt.clientAge}</span>}
                          </div>
                          <button className="cal-sidebar-item-delete" title="Remove" onClick={() => deleteAppointment(appt.id)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                        <div className="cal-sidebar-item-time">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {formatTime(startTime)} – {formatTime(endTime)}
                          <span className="cal-sidebar-item-duration">{appt.duration || 60} min</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="cal-sidebar-header">
                <h4>Today's Schedule</h4>
              </div>
              {todayAppts.length === 0 ? (
                <div className="cal-sidebar-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.25}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p>No sessions today</p>
                  <button className="btn btn-secondary cal-sidebar-new" onClick={openNewSession}>
                    Schedule a Session
                  </button>
                </div>
              ) : (
                <div className="cal-sidebar-list">
                  {todayAppts.map((appt) => {
                    const color = APPOINTMENT_COLOR;
                    const startTime = new Date(appt.dateTime);
                    const endTime = new Date(appt.dateTime + (appt.duration || 60) * 60000);
                    return (
                      <div key={appt.id} className="cal-sidebar-item" style={{ borderLeft: `4px solid ${color.border}` }}>
                        <div className="cal-sidebar-item-header">
                          <div className="cal-sidebar-item-avatar" style={{ background: color.border }}>
                            {appt.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div className="cal-sidebar-item-info">
                            <h5>{appt.clientName}</h5>
                            {appt.clientAge && <span className="cal-sidebar-item-age">Age {appt.clientAge}</span>}
                          </div>
                        </div>
                        <div className="cal-sidebar-item-time">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          {formatTime(startTime)} – {formatTime(endTime)}
                          <span className="cal-sidebar-item-duration">{appt.duration || 60} min</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* New Session Modal */}
      {showModal && (
        <div className="cal-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="cal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cal-modal-header">
              <h3>Schedule New Session</h3>
              <button className="cal-modal-close" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form className="cal-modal-form" onSubmit={handleCreateSession}>
              {formError && <div className="cal-form-error">{formError}</div>}

              <div className="cal-form-group">
                <label>Client Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => { setFormName(e.target.value); setFormError(''); }}
                  placeholder="Enter client name"
                  list="client-suggestions"
                  autoFocus
                />
                <datalist id="client-suggestions">
                  {clientNames.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>

              <div className="cal-form-group">
                <label>Client Age</label>
                <input
                  type="number"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  placeholder="Age (optional)"
                  min="1"
                  max="120"
                />
              </div>

              <div className="cal-form-row">
                <div className="cal-form-group">
                  <label>Appointment Date <span className="required">*</span></label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => { setFormDate(e.target.value); setFormError(''); }}
                  />
                </div>
                <div className="cal-form-group">
                  <label>Appointment Time <span className="required">*</span></label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => { setFormTime(e.target.value); setFormError(''); }}
                  />
                </div>
              </div>

              <div className="cal-form-group">
                <label>Session Duration</label>
                <div className="cal-duration-options">
                  {['30', '45', '60', '90', '120'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`cal-duration-btn${formDuration === d ? ' active' : ''}`}
                      onClick={() => setFormDuration(d)}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              <div className="cal-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
