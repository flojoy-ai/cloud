#!/bin/bash
sudo apt update -y
# Install nginx
sudo apt install nginx -y

# Install docker
sudo snap install docker

# Configure Nginx reverse proxy
nginx_config="server {
listen 80;

server_name _;

location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade ;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host \$host;
    proxy_cache_bypass \$http_upgrade;
    }
}"

defaut_server_config=""
echo "$defaut_server_config" >/etc/nginx/sites-enabled/default
echo "$defaut_server_config" >/etc/nginx/sites-available/default
echo "$nginx_config" >/etc/nginx/conf.d/default.conf

# Create a systemd service file
cat <<EOF >/etc/systemd/system/cloud_app.service
[Unit]
Description=Cloud Startup Service
Requires=snap.docker.dockerd.service
After=snap.docker.dockerd.service

[Service]
Type=simple
WorkingDirectory=/root/cloud
ExecStart=/bin/bash /root/startup.sh
Restart=on-failure
RestartSec=10
StartLimitInterval=60
StartLimitBurst=1

[Install]
WantedBy=default.target
EOF

# Create a shell script to run on startup
cat <<EOF >/root/startup.sh
#!/bin/bash

systemctl start nginx

source ~/.bashrc

check_env_file() {
  if [ -f "/root/cloud/.env" ]; then
    return 0
  else
    return 1 
  fi
}

git stash

git pull


for i in {1..8}; do
  sleep \$((3 + (i - 1) * 30)) 
  echo "Checking for .env file... Attempt \$i"
  if check_env_file; then
    break
  fi
done

if ! check_env_file; then
  echo "Error: .env file not found after multiple attempts."
  exit 1
fi

docker compose --progress=plain build --no-cache &>> /root/cloud-build.log
docker compose --progress=plain up &>> /root/cloud-log.log

EOF

# Make the startup script executable
chmod +x /root/startup.sh

# Reload systemd to pick up the new service
systemctl daemon-reload

# Enable and start the service
systemctl enable cloud_app.service

# Stop Nginx
systemctl stop nginx

git clone --single-branch --branch mahbub/terraform-with-docker https://github.com/flojoy-ai/cloud.git /root/cloud
