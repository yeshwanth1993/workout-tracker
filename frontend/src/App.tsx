import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Progress from './Progress';
import Streak from './Streak';

interface Workout {
  exercise_id: number;
  weight: number;
  reps: number;
  date: string;
}

interface Exercise {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

interface OptionType {
  value: number;
  label: string;
  imageUrl: string;
}

const formatOptionLabel = ({ label, imageUrl }: OptionType) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <img src={imageUrl} alt={label} style={{ width: 30, height: 30, marginRight: 10 }} />
    <span>{label}</span>
  </div>
);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const adjustedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
  const day = adjustedDate.getDate();
  const month = adjustedDate.toLocaleString('default', { month: 'short' });
  const year = adjustedDate.getFullYear().toString().slice(-2);

  let daySuffix;
  if (day > 3 && day < 21) {
    daySuffix = 'th';
  } else {
    switch (day % 10) {
      case 1:  daySuffix = "st"; break;
      case 2:  daySuffix = "nd"; break;
      case 3:  daySuffix = "rd"; break;
      default: daySuffix = "th";
    }
  }

  return `${day}${daySuffix} ${month} '${year}`;
};

function App() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<OptionType | null>(null);
  const [weight, setWeight] = useState<number | '' > ('');
  const [reps, setReps] = useState<number | '' > ('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState < string | null > (null);

  useEffect(() => {
    axios.get('http://localhost:8080/workouts').then(response => {
      setWorkouts(response.data);
    }).catch(err => {
      setError('Error fetching workouts: ' + err.message);
    });
    axios.get('http://localhost:8080/exercises').then(response => {
      setExercises(response.data);
    }).catch(err => {
      setError('Error fetching exercises: ' + err.message);
    });
  }, []);

  const handleCreateWorkout = () => {
    if (selectedExercise && weight && reps && date) {
      axios.post('http://localhost:8080/workouts', {
        exercise_id: selectedExercise.value,
        weight: weight,
        reps: reps,
        date: date
      }).then(response => {
        setWorkouts([...workouts, response.data]);
        setSelectedExercise(null);
        setWeight('');
        setReps('');
        setDate(new Date().toISOString().split('T')[0]);
      });
    }
  };

  const exerciseOptions: OptionType[] = exercises.map(exercise => ({
    value: exercise.id,
    label: exercise.name,
    imageUrl: exercise.imageUrl
  }));

  const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groupedWorkouts = sortedWorkouts.reduce((acc, workout) => {
    const formattedDate = formatDate(workout.date);
    if (!acc[formattedDate]) {
      acc[formattedDate] = {};
    }
    if (!acc[formattedDate][workout.exercise_id]) {
      acc[formattedDate][workout.exercise_id] = [];
    }
    acc[formattedDate][workout.exercise_id].push(workout);
    return acc;
  }, {} as Record<string, Record<number, Workout[]>>);

  return (
    <>
      <nav className="navbar" style={{ textAlign: 'center' }}>
        <div className="navbar-brand">Workout Tracker</div>
      </nav>
      <div className="container">
        {error && <div className="alert alert-danger mt-4">{error}</div>}

        <div className="main-content">
          <div className="card mb-4">
            <div className="card-header">
              Log Workout
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Exercise</label>
                <Select
                  options={exerciseOptions}
                  value={selectedExercise}
                  onChange={option => setSelectedExercise(option as OptionType)}
                  formatOptionLabel={formatOptionLabel}
                  placeholder="Select an exercise"
                />
              </div>
              <div className="form-group">
                <label>Weight (lbs)</label>
                <input
                  type="number"
                  className="form-control"
                  value={weight}
                  onChange={e => setWeight(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Reps</label>
                <input
                  type="number"
                  className="form-control"
                  value={reps}
                  onChange={e => setReps(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
              <button className="btn btn-primary mt-3" onClick={handleCreateWorkout}>
                Log Workout
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              Workouts
            </div>
            <div className="card-body">
              {Object.entries(groupedWorkouts).map(([date, exercisesForDate]) => (
                <div key={date} className="mb-4">
                  <h5>{date}</h5>
                  <ul className="list-group">
                    {Object.entries(exercisesForDate).map(([exerciseId, workoutSets]) => {
                      const exercise = exercises.find(e => e.id === Number(exerciseId));
                      return (
                        <li key={exerciseId} className="list-group-item d-flex align-items-center">
                          <img src={exercise?.imageUrl} alt={exercise?.name} style={{ width: 50, height: 50, marginRight: 15 }} />
                          <div>
                            <strong>{exercise?.name}</strong>
                            {workoutSets.map((set, index) => (
                              <div key={index}>{set.weight} lbs x {set.reps} reps</div>
                            ))}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Progress exercises={exercises} />
        <Streak />
      </div>
    </>
  );
}

export default App;
