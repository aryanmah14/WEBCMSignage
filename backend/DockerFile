FROM node:18-alpine
 
WORKDIR /app
 
COPY package*.json ./
 
# Install dependencies
RUN npm install --force
 
COPY . .
 
EXPOSE 5000
 
CMD ["npm", "run", "start"]
