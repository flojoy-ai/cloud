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
# Allow node to bind to privileged ports like 80
sudo apt-get install libcap2-bin
NODE_PATH="$(which node)"

sudo setcap cap_net_bind_service=+ep "$(readlink -f "$NODE_PATH")"

# Create a systemd service file
cat <<EOF >/etc/systemd/system/cloud_app.service
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
Environment="DATABASE_URL=postgresql://flojoy:Hk5pQw9rJz2X@localhost:5432/flojoy_cloud"
Environment="NODE_TLS_REJECT_UNAUTHORIZED=0"
Environment="JWT_SECRET=7851158cc1c255e7d5dada55f5ff05a366d6f45ea6eb73bccd9d2670996a2b24"
Environment="AWS_AMI=1"

[Install]
WantedBy=default.target
EOF

# Create a shell script to run on startup
cat <<EOF >/root/startup_script.sh
#!/bin/bash

. /.nvm/nvm.sh

export PATH="$PWD/node_modules/.bin:$PATH"

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

pnpm start -p 80

EOF

# Make the startup script executable
chmod +x /root/startup_script.sh

# Reload systemd to pick up the new service
systemctl daemon-reload

# Enable and start the service
systemctl enable cloud_app.service

# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql postgresql-contrib

# Create database and user
su - postgres -c "createdb flojoy_cloud"
su - postgres -c "createuser flojoy"
echo "Created database and user: $?"

su - postgres -c "psql -c \"ALTER USER flojoy WITH ENCRYPTED PASSWORD 'Hk5pQw9rJz2X';\""

su - postgres -c "psql -c \"GRANT ALL PRIVILEGES ON DATABASE flojoy_cloud TO flojoy;\""
