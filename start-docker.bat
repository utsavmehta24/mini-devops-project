@echo off
echo Starting mini-devops-container...
docker run -d -p 5000:5000 --name mini-devops-container --restart unless-stopped mini-devops-app
echo.
echo Container started!
echo.
echo Checking container status...
docker ps --filter "name=mini-devops-container"
echo.
echo Checking logs...
timeout /t 2 /nobreak >nul
docker logs mini-devops-container
echo.
echo Application is running at http://localhost:5000
echo.
echo Useful commands:
echo - View logs: docker logs mini-devops-container
echo - Stop container: docker stop mini-devops-container
echo - Remove container: docker rm mini-devops-container
