import React from 'react';

const Calendar = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-text">Calendar</h1>
        <p className="text-muted mt-2">Track deadlines and events</p>
      </div>
      
      <div className="bg-card rounded-lg shadow p-8 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold text-text mb-2">Project Calendar</h3>
        <p className="text-muted">View all your deadlines and meetings</p>
      </div>
    </div>
  );
};

export default Calendar;