FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
COPY . .
ENV HOST=0.0.0.0 PORT=4000
EXPOSE 4000
CMD ["npm","run","start"]
