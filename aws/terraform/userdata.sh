#!/bin/bash
# sudo apt update -y
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# source ~/.bashrc
# nvm install node
# sudo apt install nginx
# sudo systemctl start nginx
# sudo systemctl enable nginx
# sudo sh -c 'echo "server {
#     listen 80;

#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#     }
# }" > /etc/nginx/conf.d/default.conf'
# sudo apt-get install libcap2-bin
# sudo setcap cap_net_bind_service=+ep $(readlink -f \`which node\`)

# # Install SSL/TLS certificate using ACM (replace <your-acm-certificate-arn>)
# #   sudo amazon-linux-extras install -y nginx1.12
# #   sudo yum install -y certbot
# #   sudo certbot --nginx -d $(curl -s http://169.254.169.254/latest/meta-data/public-hostname)

# #   # Restart Nginx to apply the changes

# # Install Nginx
# sudo apt install nginx -y
# # Enable Nginx
# sudo systemctl enable nginx
# # Configure Nginx reverse proxy
# nginx_config="server {
# listen 80;

# location / {
#     proxy_pass http://localhost:3000;
#     proxy_http_version 1.1;
#     proxy_set_header Upgrade \$http_upgrade ;
#     proxy_set_header Connection 'upgrade';
#     proxy_set_header Host \$host;
#     proxy_cache_bypass \$http_upgrade;
#     }
# }"

# defaut_server_config="server {
# 	listen 80;

# 	root /root/cloud/index.html;

# 	location / {
# 		try_files \$uri \$uri/ =404;
# 	}
# }"
# echo "$defaut_server_config" >/etc/nginx/sites-enabled/default
# echo "$nginx_config" >/etc/nginx/conf.d/default.conf

# Function to check if .env file exists
check_env_file() {
    if [ -f "/root/cloud/.env" ]; then
        return 0 # .env file found
    else
        return 1 # .env file not found
    fi
}

# Run pnpm install
pnpm install

# Check for .env file in incremental intervals
for i in {1..5}; do
    sleep $((3 + (i - 1) * 30))
    if check_env_file; then
        break # Exit loop if .env file is found
    fi
done

# Exit with non-zero status if .env file is not found
if ! check_env_file; then
    echo "Error: .env file not found after multiple attempts."
    exit 1
fi

# Continue with other commands

# Run pnpm build
pnpm build

# Run pnpm start (assuming it's a Node.js app)
pnpm start &

# Start nginx service
systemctl start nginx
