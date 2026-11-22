# مرحله ۱: ساخت (Build) پروژه
FROM node:20-alpine AS builder

WORKDIR /app

# نصب openssl (برای اجرای صحیح Prisma روی لینوکس Alpine)
RUN apk add --no-cache openssl

# کپی کردن فایل‌های پکیج و نصب وابستگی‌ها
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# کپی کردن کل سورس کد، تولید کلاینت Prisma و بیلد NestJS
COPY . .
RUN npx prisma generate
RUN npm run build

# مرحله ۲: اجرای نهایی (سبک و آماده پروداکشن)
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

# کپی کردن فقط فایل‌های لازم از مرحله قبل
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# هنگام اجرا: اول جدول‌های دیتابیس را خودکار می‌سازد و بعد سرور NestJS را روشن می‌کند
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/main"]