@echo off
echo Starting OUT POST System...

start "OUT POST Backend" cmd /k "cd . && npm run dev"
echo Backend started on port 3002...

timeout /t 5

start "OUT POST Frontend" cmd /k "cd frontend && npm run dev"
echo Frontend started on port 5173...

echo System is running!
echo Open http://localhost:5173 in your browser.
pause
