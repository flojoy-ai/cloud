#!/bin/bash
sudo apt update -y
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Activate NVM
. /.nvm/nvm.sh
# Install Node.js
nvm install node
# Install pnpm
npm install -g pnpm

# Install nginx
sudo apt install nginx -y

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

jwt_secret=$(head -c 32 /dev/urandom | base64)
db_pass=$(LC_ALL=C tr </dev/urandom -dc 'A-Za-z0-9' | head -c 20)

cat <<EOF >/etc/systemd/system/cloud_app.d/Environment
HOME=/root
JWT_SECRET=${jwt_secret}
DATABASE_URL=postgresql://flojoy:${db_pass}@localhost:5432/flojoy_cloud
AWS_AMI=1
NODE_TLS_REJECT_UNAUTHORIZED=0
EOF

# Create a systemd service file
cat <<EOF >/etc/systemd/system/cloud_app.service
[Unit]
Description=Cloud Startup Service
After=network.target

[Service]
Type=simple
WorkingDirectory=/root/cloud
ExecStart=/bin/bash /root/startup.sh
Restart=on-failure
RestartSec=3
StartLimitInterval=60
StartLimitBurst=1
EnvironmentFile=/etc/systemd/system/cloud_app.d/Environment

[Install]
WantedBy=default.target
EOF

# Create a shell script to run on startup
cat <<EOF >/root/startup.sh
#!/bin/bash

systemctl start nginx

export PATH="\$PWD/node_modules/.bin:$PATH"

check_env_file() {
  if [ -f "/root/cloud/.env" ]; then
    return 0
  else
    return 1 
  fi
}

git stash

git pull

db_push_needed=true
if [ -d "/root/cloud/node_modules" ]; then
  db_push_needed=false
fi

pnpm install

for i in {1..8}; do
  sleep \$((3 + (i - 1) * 30)) 
  if check_env_file; then
    break
  fi
done

if ! check_env_file; then
  # delete node_modules
  rm -rf /root/cloud/node_modules
  echo "Error: .env file not found after multiple attempts."
  exit 1
fi

if \$db_push_needed; then
  pnpm db:generate
  pnpm db:push
fi

pnpm build

pnpm start

EOF

# Make the startup script executable
chmod +x /root/startup.sh

# Reload systemd to pick up the new service
systemctl daemon-reload

# Enable and start the service
systemctl enable cloud_app.service

# Stop Nginx
systemctl stop nginx

# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Create database and user
su - postgres -c "createdb flojoy_cloud"
su - postgres -c "createuser flojoy"
echo "Created database and user: $?"

su - postgres -c "psql -c \"ALTER USER flojoy WITH ENCRYPTED PASSWORD '${db_pass}';\""

su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE flojoy_cloud TO flojoy;\""

git clone https://github.com/flojoy-ai/cloud.git /root/cloud
