FROM ubuntu:16.04
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y nginx
COPY docker/* /etc/nginx/
COPY src/* /var/www/html/
EXPOSE 80
CMD ["/usr/sbin/nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
