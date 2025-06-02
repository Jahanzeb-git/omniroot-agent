#!/usr/bin/env bash
set -e

################################################################################
# 1) Start the Flask backend in the background                                  #
################################################################################

# Point Flask to the backend app
export FLASK_APP=/workspace/Backend/app.py
export FLASK_RUN_HOST=0.0.0.0
export FLASK_RUN_PORT=5001

cd /app/Backend
python /app/Backend/app.py &

echo "→ Flask backend started on http://0.0.0.0:5001"

################################################################################
# 2) Serve the Frontend build (dist/) on port 5173 using `npx serve`           #
################################################################################

cd /app/Frontend

# `npx serve -s dist -l 5173` serves the static files from /workspace/Frontend/dist
npx serve -s dist -l 5173 &

echo "→ Frontend static server started on http://0.0.0.0:5173"

################################################################################
# 3) Keep the container running indefinitely                                    #
################################################################################

exec tail -f /dev/null
