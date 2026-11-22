# مرحله ۱: ساخت (Build) فایل‌های نهایی React با Vite
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# آدرس بک‌اند هنگام Build داخل کد فرانت‌اند قرار می‌گیرد
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# مرحله ۲: اجرای فایل‌های ساخته‌شده روی وب‌سرور سبک Nginx
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]