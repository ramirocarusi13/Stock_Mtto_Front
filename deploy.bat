git pull
docker build . -t panol-front:latest && docker stop panol-front & docker rm panol-front & docker run -d --restart unless-stopped --name panol-front -p 9051:80 panol-front:latest
