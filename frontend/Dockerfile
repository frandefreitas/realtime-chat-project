FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
COPY . .
ENV HOST=0.0.0.0 PORT=3000
EXPOSE 3000
# Garanta no package.json: "dev": "next dev -H 0.0.0.0 -p 3000"
CMD ["npm","run","dev"]
