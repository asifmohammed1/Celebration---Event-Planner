FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf      /etc/nginx/nginx.conf
COPY index.html      /usr/share/nginx/html/
COPY sw.js           /usr/share/nginx/html/
COPY manifest.json   /usr/share/nginx/html/
COPY css/            /usr/share/nginx/html/css/
COPY js/             /usr/share/nginx/html/js/

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
