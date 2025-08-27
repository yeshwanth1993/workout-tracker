
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from datetime import date

app = FastAPI()

# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class Workout(BaseModel):
    exercise_id: int
    weight: float
    reps: int
    date: date

@app.get("/exercises")
def get_exercises():
    with open("exercises.json", "r") as f:
        return json.load(f)

@app.get("/workouts")
def get_workouts():
    with open("workouts.json", "r") as f:
        return json.load(f)

@app.post("/workouts")
def create_workout(workout: Workout):
    with open("workouts.json", "r+") as f:
        workouts = json.load(f)
        workouts.append(workout.model_dump())
        f.seek(0)
        json.dump(workouts, f, indent=4, default=str)
    return workout
