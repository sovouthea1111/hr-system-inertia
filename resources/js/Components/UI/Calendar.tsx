import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CalendarDatePicker() {
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [selectedYear, setSelectedYear] = useState(2025);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 10 }, (_, i) => 2020 + i);

  const getDaysInMonth = (month: string, year: number) => {
    const monthIndex = months.indexOf(month);
    return new Date(year, monthIndex + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: string, year: number) => {
    const monthIndex = months.indexOf(month);
    return new Date(year, monthIndex, 1).getDay();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    const prevMonth = selectedMonth === 'January' ? 'December' : months[months.indexOf(selectedMonth) - 1];
    const prevYear = selectedMonth === 'January' ? selectedYear - 1 : selectedYear;
    const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <button
          key={`prev-${daysInPrevMonth - i}`}
          className="h-8 w-8 text-sm text-gray-400 hover:bg-gray-100 rounded"
        >
          {daysInPrevMonth - i}
        </button>
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(day)}
          className={`h-8 w-8 text-sm rounded hover:bg-gray-100 ${
            day === selectedDate
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'text-gray-700'
          }`}
        >
          {day}
        </button>
      );
    }

    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <button
          key={`next-${day}`}
          className="h-8 w-8 text-sm text-gray-400 hover:bg-gray-100 rounded"
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-blue-300 p-4 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-80">
        {/* Header with selected date */}
        <div className="flex items-center justify-between mb-6">
          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            <span className="text-gray-700 font-medium">
              {selectedMonth} {selectedDate}, {selectedYear}
            </span>
          </div>
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Month and Year selectors */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full appearance-none bg-gray-50 border-0 rounded-lg px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="flex-1 relative">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full appearance-none bg-gray-50 border-0 rounded-lg px-4 py-2 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Calendar header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {renderCalendarDays()}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between">
          <button className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium">
            Cancel
          </button>
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}