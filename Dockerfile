# Use the official Node.js image as the base image
FROM node:lts-alpine3.22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install -g pnpm pm2 && pnpm install

# Copy the rest of the application files
# COPY . .
# 复制当前所有代码到/app工作目录
COPY dist/ .

RUN pnpm prisma:generate

# Build the NestJS application
RUN pnpm run build

# Expose the application port
EXPOSE 3000

# Command to run the application
# CMD ["node", "dist/main"]
# CMD ["pnpm", "start:prod"]
# pm2 start ecosystem.config.js --env production
CMD ["pm2", "start", "ecosystem.config.js", "--env", "production"]


#  docker build -t my-nestjs-app .