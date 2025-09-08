import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Streak.css';

interface WorkoutDetail {
  exercise_name: string;
  weight: number;
  reps: number;
}

interface WorkoutsByDay {
  [day: number]: WorkoutDetail[];
}

const Streak = () => {
  const [viewType, setViewType] = useState('daily'); // 'daily' or 'weekly'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeDays, setActiveDays] = useState<number[]>([]);
  const [activeWeeks, setActiveWeeks] = useState<number[]>([]);
  const [workoutsByDay, setWorkoutsByDay] = useState<WorkoutsByDay>({});
  const [tooltipContent, setTooltipContent] = useState<WorkoutDetail[]>([]);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const year = currentDate.getFullYear();
      if (viewType === 'daily') {
        const month = currentDate.getMonth() + 1;
        try {
          const response = await axios.get(`http://localhost:8080/streak?type=daily&year=${year}&month=${month}`);
          setActiveDays(response.data.active_days);
          setWorkoutsByDay(response.data.workouts_by_day);
        } catch (error) {
          console.error("Error fetching daily streak data:", error);
        }
      } else {
        try {
          const response = await axios.get(`http://localhost:8080/streak?type=weekly&year=${year}`);
          setActiveWeeks(response.data.active_weeks);
        } catch (error) {
          console.error("Error fetching weekly streak data:", error);
        }
      }
    };
    fetchData();
  }, [viewType, currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleMouseEnter = (day: number, e: React.MouseEvent) => {
    if (workoutsByDay[day]) {
      setTooltipContent(workoutsByDay[day]);
      setTooltipPosition({ x: e.pageX, y: e.pageY });
      setTooltipVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  const renderDailyView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const is_active = activeDays.includes(day);
      calendarDays.push(
        <div 
          key={day} 
          className={`calendar-day ${is_active ? 'active' : ''}`}
          onMouseEnter={(e) => handleMouseEnter(day, e)}
          onMouseLeave={handleMouseLeave}
        >
          {is_active ? '🔥' : day}
        </div>
      );
    }

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-sm btn-outline-secondary" onClick={handlePrevMonth}>&lt;</button>
          <h5>{monthName} {year}</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={handleNextMonth}>&gt;</button>
        </div>
        <div className="calendar-grid">
          <div className="calendar-day font-weight-bold">Sun</div>
          <div className="calendar-day font-weight-bold">Mon</div>
          <div className="calendar-day font-weight-bold">Tue</div>
          <div className="calendar-day font-weight-bold">Wed</div>
          <div className="calendar-day font-weight-bold">Thu</div>
          <div className="calendar-day font-weight-bold">Fri</div>
          <div className="calendar-day font-weight-bold">Sat</div>
          {calendarDays}
        </div>
      </div>
    );
  };

  const handlePrevYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() - 1, 1, 1));
  };

  const handleNextYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() + 1, 1, 1));
  };

  const renderWeeklyView = () => {
    const year = currentDate.getFullYear();
    const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button className="btn btn-sm btn-outline-secondary" onClick={handlePrevYear}>&lt;</button>
          <h5>{year}</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={handleNextYear}>&gt;</button>
        </div>
        <div className="weekly-grid">
          {weeks.map(week => {
            const is_active = activeWeeks.includes(week);
            return (
              <div key={week} className={`week-box ${is_active ? 'active' : ''}`}>
                {is_active ? '🔥' : week}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="card mt-4">
      {tooltipVisible && (
        <div className="tooltip" style={{ top: tooltipPosition.y + 10, left: tooltipPosition.x + 10 }}>
          {tooltipContent.map((workout, index) => (
            <div key={index}>
              <strong>{workout.exercise_name}</strong>: {workout.weight} lbs x {workout.reps} reps
            </div>
          ))}
        </div>
      )}
      <div className="card-header text-center">
        <h5>Streak</h5>
        <div className="btn-group" role="group">
          <button type="button" className={`btn ${viewType === 'daily' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewType('daily')}>Daily</button>
          <button type="button" className={`btn ${viewType === 'weekly' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewType('weekly')}>Weekly</button>
        </div>
      </div>
      <div className="card-body">
        {viewType === 'daily' ? renderDailyView() : renderWeeklyView()}
      </div>
    </div>
  );
};

export default Streak;
