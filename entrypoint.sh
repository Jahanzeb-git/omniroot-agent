#!/usr/bin/env bash
set -e

echo "=== Starting OmniRoot Agent ==="

# Ensure /data directory exists and is writable
mkdir -p /data
chmod 755 /data

# Set static environment variables
USER=omniroot
HOME=/home/omniroot
WORKSPACE_DIR=/app/workspace
# working directory: /app/workspace...

echo "→ Environment setup:"
echo "  USER: $USER"
echo "  HOME: $HOME"
echo "  WORKSPACE_DIR: $WORKSPACE_DIR"

# Start Flask backend
export FLASK_APP=/app/Backend/app.py
export FLASK_RUN_HOST=0.0.0.0
export FLASK_RUN_PORT=5001

echo "→ Starting Flask backend..."
cd /app/Backend
python /app/Backend/app.py &
FLASK_PID=$!

echo "  ✓ Flask backend started on http://0.0.0.0:5001 (PID: $FLASK_PID)"

# Start Frontend static server
echo "→ Starting Frontend static server..."
cd /app/Frontend
npx serve -s dist -l 5173 &
SERVE_PID=$!

echo "  ✓ Frontend static server started on http://0.0.0.0:5173 (PID: $SERVE_PID)"

# Start code-server
echo "→ Starting code-server..."
code-server --bind-addr 0.0.0.0:8080 --auth none $WORKSPACE_DIR &
CODE_SERVER_PID=$!

echo "  ✓ Code-server started on http://0.0.0.0:8080 (PID: $CODE_SERVER_PID)"

# Health check function
check_services() {
    local flask_running=false
    local serve_running=false
    local code_server_running=false
    
    if kill -0 $FLASK_PID 2>/dev/null; then
        flask_running=true
    fi
    
    if kill -0 $SERVE_PID 2>/dev/null; then
        serve_running=true
    fi
    
    if kill -0 $CODE_SERVER_PID 2>/dev/null; then
        code_server_running=true
    fi
    
    if $flask_running && $serve_running && $code_server_running; then
        return 0
    else
        echo "Service health check failed:"
        if ! $flask_running; then
            echo "  ✗ Flask backend (PID: $FLASK_PID) is not running"
        fi
        if ! $serve_running; then
            echo "  ✗ Frontend server (PID: $SERVE_PID) is not running"
        fi
        if ! $code_server_running; then
            echo "  ✗ Code-server (PID: $CODE_SERVER_PID) is not running"
        fi
        return 1
    fi
}

# Initial health check
sleep 5  # Increased wait time for code-server startup
if check_services; then
    echo "✓ All services are running properly"
else
    echo "✗ Some services failed to start"
    exit 1
fi

echo "=== OmniRoot Agent Started Successfully ==="
echo "Services:"
echo "  • Flask Backend: http://localhost:5001"
echo "  • Frontend: http://localhost:5173"
echo "  • Code-server: http://localhost:8080"
echo "  • User: $USER"
echo "  • Working Directory: $WORKSPACE_DIR"
echo "================================"

# Cleanup function
cleanup() {
    echo "Shutting down services..."
    kill $FLASK_PID $SERVE_PID $CODE_SERVER_PID 2>/dev/null || true
    wait $FLASK_PID $SERVE_PID $CODE_SERVER_PID 2>/dev/null || true
    echo "Services stopped."
    exit 0
}

# Trap signals for graceful shutdown
trap cleanup SIGTERM SIGINT

# Keep running with periodic health checks
while true; do
    sleep 30
    if ! check_services; then
        echo "Service failure detected, exiting..."
        cleanup
    fi
done