#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping services..."
    kill $BACKEND_PID $ML_PID $FRONTEND_PID 2>/dev/null
    # Mongod is forked, so we might need to send shutdown command or kill it if we knew PID, 
    # but --fork implies it runs as daemon. We'll leave it or user can stop it manually.
    # actually, purely solely rely on user to stop mongod is annoying. 
    # But often mongod runs as service. Here I am running it manually.
    echo "Services stopped."
}

trap cleanup EXIT

echo "Starting MongoDB..."
mkdir -p mongo_data
# check if mongod is already running? If so, skip.
if pgrep -x "mongod" > /dev/null
then
    echo "MongoDB is already running."
else
    mongod --dbpath mongo_data --logpath mongod.log --fork
fi

echo "Starting Backend..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo "Starting ML Service..."
cd ml_service
source venv/bin/activate
python app.py &
ML_PID=$!
cd ..

echo "Starting Frontend..."
# interactive mode might overlap with logs.
# We'll run it and let it take over stdout mostly.
npx expo start &
FRONTEND_PID=$!

echo "All services started."
echo "Backend: http://localhost:5000"
echo "ML Service: http://localhost:5001"
echo "Frontend: Follow Expo instructions above"

# Wait for frontend to keep script alive
wait $FRONTEND_PID
