# --- Giai đoạn 1: Môi trường cơ sở & Đồng bộ múi giờ ---
FROM node:22-alpine AS base
WORKDIR /app

# ĐỒNG BỘ GIỜ: Cài đặt tzdata để các máy trong team chạy chung giờ Việt Nam
ENV TZ=Asia/Ho_Chi_Minh
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# --- Giai đoạn 2: Cài đặt thư viện (Dependencies) ---
FROM base AS deps
# Thêm libc6-compat vì một số thư viện Node.js trên Linux Alpine cần nó để chạy ổn định
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# --- Giai đoạn 3: Build dự án ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Chặn Next.js thu thập dữ liệu ẩn khi build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Giai đoạn 4: Chạy môi trường Production siêu nhẹ (~100MB) ---
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Tạo user mới để chạy app, không dùng quyền root (tăng tính bảo mật)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1002 nextjs

# Copy thư mục public (hình ảnh, icon...) nếu có
COPY --from=builder /app/public ./public

# Copy phần standalone được tối ưu từ tính năng `output: 'standalone'`
COPY --from=builder /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

# Chạy app bằng file server.js gọn nhẹ do Next.js tự tạo ra
CMD ["node", "server.js"]