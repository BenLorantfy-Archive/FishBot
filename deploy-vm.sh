#!/bin/bash

# =====================================================================================
# Script: deploy-vm.sh - benlorantfy.com/fishbot
# Author: Ben Lorantfy (ben@lorantfy.com)
# Last Updated: July 6th 2017
# =====================================================================================
# This script deploys the api and web client to a cloud virtual machine
# The following programs must be already installed for the app to deploy successfully
# - nodejs
# - npm
# - forever
# =====================================================================================

# CONSTANTS
IP=138.197.107.96
RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color
REMOTE_TIME=`ssh root@${IP} 'date'`
KERNAL_INFO=`ssh root@${IP} 'uname -a'`

# STEPS
echo ""
echo "${PURPLE}[deploy.sh]${NC} ${BLUE}=========================================================${NC}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE} Starting Deployment of benlorantfy.com/fishbot          ${NC}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE}=========================================================${NC}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE} Remote System Time: ${REMOTE_TIME}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE} Kernal Info: ${KERNAL_INFO}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE}=========================================================${NC}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE} Steps:${NC}"
echo "${PURPLE}[deploy.sh]${NC}  1.  Stop nginx"
echo "${PURPLE}[deploy.sh]${NC}  2.  Copy configuration file"
echo "${PURPLE}[deploy.sh]${NC}  3.  Start nginx"
echo "${PURPLE}[deploy.sh]${NC}  4.  Reload nginx configuration"
echo "${PURPLE}[deploy.sh]${NC}  5.  Stop all current apps"
echo "${PURPLE}[deploy.sh]${NC}  6.  Delete old frontend and backend files"
echo "${PURPLE}[deploy.sh]${NC}  7.  Copy new frontend and backend files"
echo "${PURPLE}[deploy.sh]${NC}  8.  Install dependencies for node api"
echo "${PURPLE}[deploy.sh]${NC}  9.  Start node api using forever"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE}============================================${NC}"

# BUILD REACT APP
echo "${PURPLE}[deploy.sh]${NC} Building react app..."
cd ./WebClient
npm run build
cd ../

# DELETE OLD FILES
echo "${PURPLE}[deploy.sh]${NC} Deleting old files..."
ssh root@${IP} 'rm -r "/root/fishbot"'
echo "${PURPLE}[deploy.sh]${NC} ${GREEN}Deleted${NC} old files"

# COPY NEW FILES
echo "${PURPLE}[deploy.sh]${NC} Transfering new files..."
rsync -av --exclude '.vscode' --exclude 'node_modules' --exclude '.git' --exclude '.github' . root@${IP}:/root/fishbot
echo "${PURPLE}[deploy.sh]${NC} ${GREEN}Transfered${NC} new files"

# STOP ALL APPS
echo "${PURPLE}[deploy.sh]${NC} Stopping forever scripts..."
ssh root@${IP} 'forever stop FishBotApiServer' 
ssh root@${IP} 'forever stop FishBotStreamServer' 

# INSTALL API DEPENDENCIES
echo "${PURPLE}[deploy.sh]${NC} Installing node dependencies for api server..."
ssh root@${IP} 'cd "/root/fishbot/ApiServer" && npm install --production'
echo "${PURPLE}[deploy.sh]${NC} ${GREEN}Installed${NC} dependencies"

echo "${PURPLE}[deploy.sh]${NC} Pruning node dependencies..."
ssh root@${IP} 'cd "/root/fishbot/ApiServer" && npm prune --production'
echo "${PURPLE}[deploy.sh]${NC} ${GREEN}Pruned${NC} node dependencies"

echo "${PURPLE}[deploy.sh]${NC} Installing node dependencies for stream server..."
ssh root@${IP} 'cd "/root/fishbot/StreamServer" && npm install --production'
echo "${PURPLE}[deploy.sh]${NC} ${GREEN}Installed${NC} dependencies"

echo "${PURPLE}[deploy.sh]${NC} Pruning node dependencies..."
ssh root@${IP} 'cd "/root/fishbot/StreamServer" && npm prune --production'
echo "${PURPLE}[deploy.sh]${NC} ${GREEN}Pruned${NC} node dependencies"

# START ALL APPS
# forever is used to manage and monitor all the apps
# The forever configuration is read from forever-vm.json
echo "${PURPLE}[deploy.sh]${NC} Starting all apps using forever..."
ssh root@${IP} 'forever start /root/fishbot/forever-vm.json' 
echo "${PURPLE}[deploy.sh]${NC} Listing all the started apps..."
ssh root@${IP} 'forever list' 

# RESTART NGINX
# The master nginx.conf file has to include fishbot.nginx.conf
echo "${PURPLE}[deploy.sh]${NC} Restarting nginx"
ssh root@${IP} 'nginx -s reload'

# DONE
echo "${PURPLE}[deploy.sh]${NC} ${BLUE}=========================${NC}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE}      Done Deployment    ${NC}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE}=========================${NC}"