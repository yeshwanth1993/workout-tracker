import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

interface ProgressProps {
  exercises: Exercise[];
}

const Progress: React.FC<ProgressProps> = ({ exercises }) => {
  const [selectedExercise, setSelectedExercise] = useState<OptionType | null>(null);
  const [chartData, setChartData] = useState<any>(null);

  const exerciseOptions: OptionType[] = exercises.map(exercise => ({
    value: exercise.id,
    label: exercise.name,
    imageUrl: exercise.imageUrl
  }));

  const formatOptionLabel = ({ label, imageUrl }: OptionType) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img src={imageUrl} alt={label} style={{ width: 30, height: 30, marginRight: 10 }} />
      <span>{label}</span>
    </div>
  );

  useEffect(() => {
    if (selectedExercise) {
      axios.get(`http://localhost:8080/progress?exercise_id=${selectedExercise.value}&objective=max-weight`)
        .then(response => {
          const { labels, data } = response.data;
          setChartData({
            labels,
            datasets: [
              {
                label: `Max Weight (lbs) for ${selectedExercise.label}`,
                data,
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
              },
            ],
          });
        });
    }
  }, [selectedExercise]);

  return (
    <div className="card mt-4">
      <div className="card-header">
        Progress
      </div>
      <div className="card-body">
        <Select
          options={exerciseOptions}
          value={selectedExercise}
          onChange={option => setSelectedExercise(option as OptionType)}
          formatOptionLabel={formatOptionLabel}
          placeholder="Select an exercise to see progress"
        />
        {chartData && (
          <div className="mt-4">
            <Line data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
