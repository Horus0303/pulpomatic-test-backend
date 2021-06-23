# Base image
FROM node:14

# Enviroment

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Preload countries data
RUN ["npm", "run", "load"]

# Expose port
EXPOSE 3000

# Run
RUN ["chmod", "+x", "/usr/src/app/docker-entrypoint.sh"]
ENTRYPOINT ["sh", "/usr/src/app/docker-entrypoint.sh"]
