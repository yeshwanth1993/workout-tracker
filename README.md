# Workout Tracker

## Running Tests

### Frontend

To run the frontend tests, you need to have Node.js and npm installed.

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Run the tests:
    ```bash
    npm test
    ```

### Backend

To run the backend tests, you need to have Python 3 and `venv` installed.

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment:
    ```bash
    python3 -m venv venv
    ```
3.  Activate the virtual environment:
    ```bash
    source venv/bin/activate
    ```
4.  Install the dependencies:
    ```bash
    pip install -r requirements-dev.txt
    ```
5.  Run the tests:
    ```bash
    pytest tests
    ```
