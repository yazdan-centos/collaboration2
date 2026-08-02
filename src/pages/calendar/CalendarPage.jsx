import React, { useState } from 'react';
import {
    startOfMonth,
    getDaysInMonth,
    getDay,
    addMonths,
    subMonths,
    format,
    startOfWeek,
    addDays,
    subDays,
    addWeeks,
    subWeeks,
    isSameDay
} from 'date-fns-jalali';

// Sample events using Jalaali ISO strings (YYYY-MM-DD)
const SAMPLE_EVENTS = [
    { id: 1, title: 'جلسه هماهنگی تیم', date: '1405-05-13', startTime: '09:00', duration: 60, color: 'bg-blue-500' },
    { id: 2, title: 'بررسی محصول', date: '1405-05-14', startTime: '11:00', duration: 90, color: 'bg-teal-500' },
    { id: 3, title: 'ناهار با مشتری', date: '1405-05-14', startTime: '13:00', duration: 60, color: 'bg-purple-500' },
    { id: 4, title: 'کارگاه طراحی', date: '1405-05-16', startTime: '14:00', duration: 120, color: 'bg-blue-500' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
const DAYS_OF_WEEK = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const FULL_DAYS_OF_WEEK = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date('2026-08-04')); // Anchored in Mordad 1405
    const [viewMode, setViewMode] = useState('ماه'); // روز, هفته, ماه

    // --- Core Date Math Adapters ---
    const totalDays = getDaysInMonth(currentDate);
    const firstDayOfMonth = startOfMonth(currentDate);
    const standardDayIndex = getDay(firstDayOfMonth);
    const jalaaliStartDayIndex = (standardDayIndex + 1) % 7;

    // Format header strings
    const formattedMonthYear = format(currentDate, 'MMMM yyyy');
    const formattedDayViewHeader = format(currentDate, 'dd MMMM yyyy');

    // Navigation handlers across distinct view-modes
    const handleNext = () => {
        if (viewMode === 'ماه') setCurrentDate(addMonths(currentDate, 1));
        if (viewMode === 'هفته') setCurrentDate(addWeeks(currentDate, 1));
        if (viewMode === 'روز') setCurrentDate(addDays(currentDate, 1));
    };

    const handlePrev = () => {
        if (viewMode === 'ماه') setCurrentDate(subMonths(currentDate, 1));
        if (viewMode === 'هفته') setCurrentDate(subWeeks(currentDate, 1));
        if (viewMode === 'روز') setCurrentDate(subDays(currentDate, 1));
    };

    // --- 1. Month View Cells Generation ---
    const monthCells = [];
    for (let i = 0; i < jalaaliStartDayIndex; i++) monthCells.push(null);
    for (let d = 1; d <= totalDays; d++) monthCells.push(d);

    // --- 2. Week View Days Generation ---
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 6 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // --- 3. Day View Derived Values ---
    const dayViewWeekdayIndex = (getDay(currentDate) + 1) % 7;

    // --- Live "Now" Marker (Current-Time Indicator) ---
    const now = new Date();
    const nowOffsetRem = ((now.getHours() * 60 + now.getMinutes()) / 60) * 4;

    // --- Helpers for Styling and Evaluation ---
    const isWeekendIndex = (idx) => idx === 5 || idx === 6; // 5 = Thursday (پ), 6 = Friday (ج)

    return (
        <div className="flex h-screen flex-col bg-white text-gray-900 select-none font-sans" dir="rtl">

            {/* Outlook Stylized Header Navbar */}
            <header className="flex items-center justify-between border-b border-gray-200 px-6 py-3 bg-gray-50 flex-shrink-0">
                <div className="flex items-center space-x-reverse space-x-6">
                    <span className="text-xl font-bold text-blue-600 tracking-tight">تقویم </span>
                    <button
                        onClick={() => setCurrentDate(new Date())}
                        className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-gray-50 transition"
                    >
                        امروز
                    </button>

                    <div className="flex items-center space-x-reverse space-x-2">
                        <button onClick={handlePrev} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 text-lg">
                            &rsaquo;
                        </button>
                        <h1 className="text-lg font-bold min-w-[180px] text-center text-gray-800">
                            {viewMode === 'روز' ? formattedDayViewHeader : formattedMonthYear}
                        </h1>
                        <button onClick={handleNext} className="p-1.5 rounded hover:bg-gray-200 text-gray-600 text-lg">
                            &lsaquo;
                        </button>
                    </div>
                </div>

                {/* View Switcher Segmented Button Control */}
                <div className="flex rounded-md shadow-sm">
                    {['روز', 'هفته', 'ماه'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-4 py-1.5 text-sm font-medium border first:rounded-r-md last:rounded-l-md -mr-px ${
                                viewMode === mode
                                    ? 'bg-blue-600 text-white border-blue-600 z-10'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {mode}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Workspace Frame */}
            <div className="flex flex-1 overflow-hidden">

                {/* Right Sidebar Strip */}
                <aside className="w-64 border-l border-gray-200 p-4 space-y-6 hidden md:block bg-gray-50 flex-shrink-0">
                    <button className="w-full bg-blue-600 text-white rounded-full py-2.5 font-bold shadow hover:bg-blue-700 transition">
                        + رویداد جدید
                    </button>
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">تقویم‌های من</h3>
                        <div className="space-y-3 text-sm">
                            <label className="flex items-center space-x-reverse space-x-2.5 cursor-pointer">
                                <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                <span className="text-gray-700 font-medium">تقویم اصلی</span>
                            </label>
                        </div>
                    </div>
                </aside>

                {/* Dynamic Views Viewport Manager */}
                <main className="flex-1 flex flex-col bg-white overflow-y-auto">

                    {/* ================================================================= MONTH VIEW */}
                    {viewMode === 'ماه' && (
                        <div className="flex flex-col flex-1 min-w-[700px]">
                            <div className="grid grid-cols-7 border-b border-gray-200 text-center bg-gray-50">
                                {DAYS_OF_WEEK.map((day, idx) => (
                                    <div key={day} className={`py-2 text-xs font-bold ${isWeekendIndex(idx) ? 'text-red-500' : 'text-gray-500'}`}>
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 flex-1 border-r border-t border-gray-100">
                                {monthCells.map((day, idx) => {
                                    const currentYearStr = format(currentDate, 'yyyy');
                                    const currentMonthStr = format(currentDate, 'MM');
                                    const normalizedMatchStr = day ? `${currentYearStr}-${currentMonthStr}-${String(day).padStart(2, '0')}` : '';
                                    const dayEvents = day ? SAMPLE_EVENTS.filter(e => e.date === normalizedMatchStr) : [];
                                    const isToday = day && isSameDay(new Date(), addDays(firstDayOfMonth, day - 1));
                                    const isWeekendCell = isWeekendIndex(idx % 7);

                                    return (
                                        <div key={idx} className="border-b border-l border-gray-200 p-1.5 min-h-[110px] flex flex-col hover:bg-gray-50 transition">
                                            {day && (
                                                <span className={`text-xs font-bold p-1 w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                                                    isToday ? 'bg-blue-600 text-white' : isWeekendCell ? 'text-red-500 font-black' : 'text-gray-700'
                                                }`}>
                          {Number(day).toLocaleString('fa-IR')}
                        </span>
                                            )}
                                            <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                                                {dayEvents.map((event) => (
                                                    <div key={event.id} className={`text-[11px] text-white px-2 py-1 rounded shadow-sm truncate font-medium ${event.color} hover:opacity-90`}>
                                                        <span className="opacity-80 ml-1.5">{event.startTime}</span>
                                                        {event.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ================================================================= WEEK VIEW */}
                    {viewMode === 'هفته' && (
                        <div className="flex flex-col flex-1 min-w-[800px] h-full overflow-x-auto">
                            <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50 text-center sticky top-0 z-20">
                                <div className="py-3 border-l border-gray-200 text-xs font-bold text-gray-400">زمان</div>
                                {weekDays.map((day, idx) => {
                                    const isToday = isSameDay(new Date(), day);
                                    return (
                                        <div key={idx} className="py-2 border-l border-gray-200 flex flex-col items-center justify-center">
                      <span className={`text-xs font-bold ${isWeekendIndex(idx) ? 'text-red-500' : 'text-gray-500'}`}>
                        {DAYS_OF_WEEK[idx]}
                      </span>
                                            <span className={`text-sm font-bold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full ${
                                                isToday ? 'bg-blue-600 text-white' : isWeekendIndex(idx) ? 'text-red-500' : 'text-gray-700'
                                            }`}>
                        {Number(format(day, 'd')).toLocaleString('fa-IR')}
                      </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="relative grid grid-cols-8 flex-1 divide-y divide-gray-100">
                                {HOURS.map((hour) => (
                                    <React.Fragment key={hour}>
                                        <div className="p-2 text-center text-xs font-medium text-gray-400 bg-gray-50 border-l border-gray-200 flex items-center justify-center h-16">
                                            {hour}
                                        </div>
                                        {weekDays.map((day, dayIdx) => {
                                            const dayDateStr = format(day, 'yyyy-MM-dd');
                                            const hourNum = parseInt(hour.split(':')[0], 10);
                                            const hourEvents = SAMPLE_EVENTS.filter(
                                                (e) => e.date === dayDateStr && parseInt(e.startTime.split(':')[0], 10) === hourNum
                                            );
                                            const isWeekendCol = isWeekendIndex(dayIdx);

                                            return (
                                                <div
                                                    key={dayIdx}
                                                    className={`relative border-l border-gray-200 h-16 hover:bg-blue-50/40 transition ${isWeekendCol ? 'bg-red-50/30' : ''}`}
                                                >
                                                    {hourEvents.map((event) => {
                                                        const eventMinute = Number(event.startTime.split(':')[1]);
                                                        const topPercent = (eventMinute / 60) * 100;
                                                        const heightPercent = (event.duration / 60) * 100;
                                                        return (
                                                            <div
                                                                key={event.id}
                                                                title={event.title}
                                                                className={`absolute right-1 left-1 z-10 rounded px-1.5 py-0.5 text-[11px] text-white font-medium shadow-sm truncate ${event.color} hover:opacity-90`}
                                                                style={{ top: `${topPercent}%`, height: `${Math.max(heightPercent, 25)}%` }}
                                                            >
                                                                <span className="opacity-80 ml-1">{event.startTime}</span>
                                                                {event.title}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                                {weekDays.some((d) => isSameDay(d, now)) && (
                                    <div
                                        className="pointer-events-none absolute inset-x-0 z-30 border-t-2 border-red-500"
                                        style={{ top: `${nowOffsetRem}rem` }}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                    {/* ================================================================= DAY VIEW */}
                    {viewMode === 'روز' && (
                        <div className="flex flex-col flex-1 min-w-[500px] h-full overflow-x-auto">
                            <div className="grid grid-cols-[88px_1fr] border-b border-gray-200 bg-gray-50 text-center sticky top-0 z-20">
                                <div className="py-3 border-l border-gray-200 text-xs font-bold text-gray-400">زمان</div>
                                <div className="py-2 flex items-center justify-center">
                  <span className={`text-xs font-bold ${
                      isSameDay(now, currentDate) ? 'text-blue-600' : isWeekendIndex(dayViewWeekdayIndex) ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {FULL_DAYS_OF_WEEK[dayViewWeekdayIndex]}
                  </span>
                                </div>
                            </div>

                            <div className="relative grid grid-cols-[88px_1fr] flex-1 divide-y divide-gray-100">
                                {HOURS.map((hour) => {
                                    const hourNum = parseInt(hour.split(':')[0], 10);
                                    const dayDateStr = format(currentDate, 'yyyy-MM-dd');
                                    const hourEvents = SAMPLE_EVENTS.filter(
                                        (e) => e.date === dayDateStr && parseInt(e.startTime.split(':')[0], 10) === hourNum
                                    );

                                    return (
                                        <React.Fragment key={hour}>
                                            <div className="p-2 text-center text-xs font-medium text-gray-400 bg-gray-50 border-l border-gray-200 flex items-center justify-center h-16">
                                                {hour}
                                            </div>
                                            <div className="relative border-l border-gray-200 h-16 hover:bg-blue-50/40 transition">
                                                {hourEvents.map((event) => {
                                                    const eventMinute = Number(event.startTime.split(':')[1]);
                                                    const topPercent = (eventMinute / 60) * 100;
                                                    const heightPercent = (event.duration / 60) * 100;
                                                    return (
                                                        <div
                                                            key={event.id}
                                                            title={event.title}
                                                            className={`absolute right-2 left-2 z-10 rounded px-2 py-1 text-xs text-white font-medium shadow-sm truncate ${event.color} hover:opacity-90`}
                                                            style={{ top: `${topPercent}%`, height: `${Math.max(heightPercent, 25)}%` }}
                                                        >
                                                            <span className="opacity-80 ml-1.5">{event.startTime}</span>
                                                            {event.title}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </React.Fragment>
                                    );
                                })}
                                {isSameDay(currentDate, now) && (
                                    <div
                                        className="pointer-events-none absolute inset-x-0 z-30 border-t-2 border-red-500"
                                        style={{ top: `${nowOffsetRem}rem` }}
                                    />
                                )}
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}