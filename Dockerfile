FROM node:lts-buster
LABEL authors="charles"

# Install ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm i -g pm2
RUN npm install

# Copy the rest of the application code
COPY . .

EXPOSE 8000

CMD ["pm2", "start", "index.js"]
