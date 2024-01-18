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
# Install pm2
npm install -g pm2
# Allow node to bind to privileged ports like 80
sudo apt-get install libcap2-bin
NODE_PATH="$(which node)"

sudo setcap cap_net_bind_service=+ep "$(readlink -f "$NODE_PATH")"

# Create a systemd service file
cat <<EOF >/etc/systemd/system/cloud_startup.service
[Unit]
Description=Cloud Startup Service
After=network.target

[Service]
Type=simple
WorkingDirectory=/root/cloud
ExecStart=/bin/bash /root/startup_script.sh
Restart=on-failure
RestartSec=3
StartLimitInterval=60
StartLimitBurst=1
Environment="HOME=/root"
Environment="LOCAL_POSTGRES_PASS=Hk5pQw9rJz2X"
Environment="DATABASE_URL=postgresql://postgres:pass@localhost:5432/neondb"
Environment="NODE_TLS_REJECT_UNAUTHORIZED=0"

[Install]
WantedBy=default.target
EOF

# Create a shell script to run on startup
cat <<EOF >/root/startup_script.sh
#!/bin/bash

. /.nvm/nvm.sh

check_env_file() {
  if [ -f "/root/cloud/.env" ]; then
    return 0
  else
    return 1 
  fi
}

pnpm install

for i in {1..8}; do
  sleep \$((3 + (i - 1) * 30)) 
  if check_env_file; then
    break
  fi
done

if ! check_env_file; then
  echo "Error: .env file not found after multiple attempts."
  exit 1
fi

pnpm build

pm2 delete cloud-app

pm2 start pnpm --name cloud-app -- start -- -p 80

EOF

# Make the startup script executable
chmod +x /root/startup_script.sh

# Reload systemd to pick up the new service
systemctl daemon-reload

# Enable and start the service
systemctl enable cloud_startup.service

# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Switch to postgres user
sudo -i -u postgres

# Create database and user
createdb flojoy_cloud

createuser flojoy

psql -c "ALTER USER flojoy WITH ENCRYPTED PASSWORD 'Hk5pQw9rJz2X';"

psql -c "GRANT ALL PRIVILEGES ON DATABASE flojoy_cloud TO flojoy;"
