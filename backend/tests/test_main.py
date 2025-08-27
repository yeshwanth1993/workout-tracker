import pytest
from httpx import AsyncClient
from fastapi.testclient import TestClient
import sys
import os
import json

# Add the parent directory to the path to import the main app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def clear_workouts_json():
    with open("workouts.json", "w") as f:
        json.dump([], f)

@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"

def test_get_exercises():
    response = client.get("/exercises")
    assert response.status_code == 200
    assert len(response.json()) == 10

def test_get_workouts_initially_empty():
    response = client.get("/workouts")
    assert response.status_code == 200
    assert response.json() == []

def test_create_workout():
    response = client.post(
        "/workouts",
        json={"exercise_id": 1, "weight": 50, "reps": 10, "date": "2025-08-27"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["exercise_id"] == 1
    assert data["weight"] == 50
    assert data["reps"] == 10
    assert data["date"] == "2025-08-27"

    response = client.get("/workouts")
    assert response.status_code == 200
    workouts = response.json()
    assert len(workouts) == 1
    assert workouts[0]["exercise_id"] == 1
    assert workouts[0]["weight"] == 50
    assert workouts[0]["reps"] == 10
    assert workouts[0]["date"] == "2025-08-27"