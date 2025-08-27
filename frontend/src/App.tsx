import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

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
}

function App() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [reps, setReps] = useState<number | ''>('');

  useEffect(() => {
    axios.get('http://localhost:8000/workouts').then(response => {
      setWorkouts(response.data);
    });
    axios.get('http://localhost:8000/exercises').then(response => {
      setExercises(response.data);
    });
  }, []);

  const handleCreateWorkout = () => {
    if (selectedExercise && weight && reps) {
      axios.post('http://localhost:8000/workouts', {
        exercise_id: selectedExercise,
        weight: weight,
        reps: reps,
        date: new Date().toISOString().split('T')[0]
      }).then(response => {
        setWorkouts([...workouts, response.data]);
        setSelectedExercise('');
        setWeight('');
        setReps('');
      });
    }
  };

  return (
    <div className="container">
      <h1 className="my-4">Workout Tracker</h1>

      <div className="card mb-4">
        <div className="card-header">
          Create Workout
        </div>
        <div className="card-body">
          <div className="form-group">
            <label>Exercise</label>
            <select
              className="form-control"
              value={selectedExercise}
              onChange={e => setSelectedExercise(Number(e.target.value))}
            >
              <option value="" disabled>Select an exercise</option>
              {exercises.map(exercise => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Weight (kg)</label>
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
          <button className="btn btn-primary mt-3" onClick={handleCreateWorkout}>
            Create Workout
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          Workouts
        </div>
        <ul className="list-group list-group-flush">
          {workouts.map((workout, index) => (
            <li key={index} className="list-group-item">
              {new Date(workout.date).toLocaleDateString()} - {}
              {exercises.find(e => e.id === workout.exercise_id)?.name}: {workout.weight}kg x {workout.reps} reps
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;