# ---- build stage ----
FROM node:24 AS builder
WORKDIR /app
# lockfile は使わないため package.json のみで解決
COPY package.json ./
RUN npm install --no-audit --no-fund --progress=false
COPY . .

# クライアントで参照する環境変数を指定
ENV NEXT_PUBLIC_RECAPTCHA_KEY="{reCAPTCHA key}"
ENV NEXT_PUBLIC_VTECXNEXT_URL="{Next.js URL}"

RUN npm run build

# ---- run stage ----
FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 8080
ENV PORT=8080
CMD ["npm", "start"]
