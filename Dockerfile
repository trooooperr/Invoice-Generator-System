# ---------- FRONTEND BUILD ----------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build


# ---------- BACKEND BUILD ----------
FROM node:20-alpine AS backend-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY app.js ./
COPY server.js ./
COPY src ./src

# copy frontend build into backend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist


# ---------- PRODUCTION SETTINGS ----------
ENV NODE_ENV=production

# Render uses dynamic port → MUST support this
ENV PORT=3000

EXPOSE 3000

# ✅ Important: handle crashes properly
CMD ["node", "server.js"]