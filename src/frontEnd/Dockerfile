FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5173
CMD ["npm", "run", "dev"]

# production
# FROM node:20-slim AS build
# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .
# RUN npm run build

# # serve
# FROM nginx:alpine
# COPY --from=build /app/dist /usr/share/nginx/html