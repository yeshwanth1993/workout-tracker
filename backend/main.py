import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
from datetime import date
import logging
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Starting backend server...")

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
    id: uuid.UUID | None = None
    exercise_id: int
    weight: float
    reps: int
    date: date


def get_week(d: date):
    """Returns the week number for a given date."""
    return d.isocalendar()[1]


@app.get("/exercises")
def get_exercises():
    logger.info("GET /exercises")
    with open("exercises.json", "r") as f:
        return json.load(f)


@app.get("/workouts")
def get_workouts():
    logger.info("GET /workouts")
    with open("workouts.json", "r") as f:
        return json.load(f)


@app.post("/workouts")
def create_workout(workout: Workout):
    logger.info(f"POST /workouts with data: {workout}")
    new_workout = workout.model_dump()
    new_workout['id'] = uuid.uuid4()
    with open("workouts.json", "r+") as f:
        workouts = json.load(f)
        workouts.append(new_workout)
        f.seek(0)
        json.dump(workouts, f, indent=4, default=str)
    return new_workout


@app.get("/progress")
def get_progress(exercise_id: int, objective: str):
    logger.info(f"GET /progress with exercise_id={exercise_id} and objective={objective}")
    with open("workouts.json", "r") as f:
        workouts = json.load(f)

    exercise_workouts = [w for w in workouts if w["exercise_id"] == exercise_id]
    logger.info(f"Found {len(exercise_workouts)} workouts for exercise_id {exercise_id}")

    if objective == "max-weight":
        weekly_max_weights = {}
        for workout in exercise_workouts:
            d = date.fromisoformat(workout["date"])
            week = get_week(d)
            year = d.year
            week_key = f"{year}-W{week}"
            if week_key not in weekly_max_weights or workout["weight"] > weekly_max_weights[week_key]:
                weekly_max_weights[week_key] = workout["weight"]

        labels = sorted(weekly_max_weights.keys())
        data = [weekly_max_weights[label] for label in labels]

        logger.info(f'Returning progress data: "labels": {labels}, "data": {data}')
        return {"labels": labels, "data": data}

    logger.warning(f"Invalid objective: {objective}")
    return {"error": "Invalid objective"}


@app.get("/streak")
def get_streak(type: str, year: int, month: Optional[int] = None):
    logger.info(f"GET /streak with type={type}, year={year}, month={month}")
    with open("workouts.json", "r") as f:
        workouts = json.load(f)

    with open("exercises.json", "r") as f:
        exercises_data = json.load(f)
    exercises_map = {exercise["id"]: exercise["name"] for exercise in exercises_data}

    if type == "daily":
        if month is None:
            return {"error": "Month is required for daily view"}

        from collections import defaultdict
        active_days = set()
        workouts_by_day = defaultdict(list)

        for workout in workouts:
            d = date.fromisoformat(workout["date"])
            if d.year == year and d.month == month:
                active_days.add(d.day)
                workouts_by_day[d.day].append({
                    "exercise_name": exercises_map.get(workout["exercise_id"], "Unknown"),
                    "weight": workout["weight"],
                    "reps": workout["reps"]
                })
        return {"active_days": sorted(list(active_days)), "workouts_by_day": workouts_by_day}

    elif type == "weekly":
        active_weeks = set()
        for workout in workouts:
            d = date.fromisoformat(workout["date"])
            if d.year == year:
                week = get_week(d)
                active_weeks.add(week)
        return {"active_weeks": sorted(list(active_weeks))}

    return {"error": "Invalid type parameter"}
