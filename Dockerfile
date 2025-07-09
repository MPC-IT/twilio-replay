# Use official Node 18 Alpine as base
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies early for caching
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy remaining app source
COPY . .

# Copy Prisma schema and related files
COPY prisma ./prisma

# Build the Next.js app
RUN npx prisma generate
RUN npm run build

# --- Runtime Image ---
FROM node:18-alpine AS runner

# Set working directory in runtime image
WORKDIR /app

# Copy built app and production deps only
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Set environment variable
ENV NODE_ENV=production

# Expose the default Next.js port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
