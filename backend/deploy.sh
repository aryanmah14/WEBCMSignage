#!/bin/bash
 
git pull
docker rm -f signage-be
docker rmi signage-be
docker build -t signage-be .
docker run -d -p 5010:5000 --name signage-be signage-be
