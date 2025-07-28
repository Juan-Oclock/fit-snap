#!/bin/bash

# Kill any process using port 3000
echo "Checking for processes using port 3000..."
PORT_PROCESS=$(lsof -i :3000 -t)

if [ -n "$PORT_PROCESS" ]; then
  echo "Found process using port 3000. Terminating..."
  kill $PORT_PROCESS
  sleep 1
  
  # Double-check if process was killed, force if necessary
  if [ -n "$(lsof -i :3000 -t)" ]; then
    echo "Process still running. Force terminating..."
    kill -9 $(lsof -i :3000 -t)
    sleep 1
  fi
  echo "Port 3000 is now free"
else
  echo "Port 3000 is already free"
fi

# Start the Next.js dev server
echo "Starting Next.js development server on port 3000..."
npm run dev
