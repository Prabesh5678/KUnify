# Use official Node image
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose app port
EXPOSE 3000

# Start app
CMD ["npm", "start"]