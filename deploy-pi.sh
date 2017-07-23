#!/bin/bash

# =====================================================================================
# Script: deploy-vm.sh - benlorantfy.com/fishbot
# Author: Ben Lorantfy (ben@lorantfy.com)
# Last Updated: July 6th 2017
# =====================================================================================
# This script deploys the feeder client to a raspberry pi
# The following programs must be already installed for the app to deploy successfully
# - nodejs
# - npm
# - forever
# =====================================================================================

# CONSTANTS
USER=pi
IP=192.168.2.53
RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color
REMOTE_TIME=`ssh ${USER}@${IP} 'date'`
KERNAL_INFO=`ssh ${USER}@${IP} 'uname -a'`

# STEPS
echo ""
echo "${PURPLE}[deploy.sh]${NC} ${BLUE}=========================================================${NC}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE} Starting Deployment of benlorantfy.com/fishbot          ${NC}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE}=========================================================${NC}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE} Remote System Time: ${REMOTE_TIME}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE} Kernal Info: ${KERNAL_INFO}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE}=========================================================${NC}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE} Steps:${NC}"
echo "${PURPLE}[deploy.sh]${NC}  1.  Stop feeder client"
echo "${PURPLE}[deploy.sh]${NC}  2.  Delete old files"
echo "${PURPLE}[deploy.sh]${NC}  3.  Copy new files"
echo "${PURPLE}[deploy.sh]${NC}  4.  Install dependencies"
echo "${PURPLE}[deploy.sh]${NC}  5.  Start using forever"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE}============================================${NC}"

# DELETE OLD FILES
echo "${PURPLE}[deploy.sh]${NC} Deleting old files..."
ssh ${USER}@${IP} 'rm -r "~/fishbot"'
echo "${PURPLE}[deploy.sh]${NC} ${GREEN}Deleted${NC} old files"

# COPY NEW FILES
echo "${PURPLE}[deploy.sh]${NC} Transfering new files..."
rsync -av --exclude '.vscode' --exclude 'node_modules' --exclude '.git' --exclude '.github' ./FeederClient ${USER}@${IP}:~/fishbot
echo "${PURPLE}[deploy.sh]${NC} ${GREEN}Transfered${NC} new files"

# # STOP ALL APPS
# echo "${PURPLE}[deploy.sh]${NC} Stopping forever scripts..."
# ssh ${USER}@${IP} 'forever stop FishBot' 

# # INSTALL API DEPENDENCIES
# echo "${PURPLE}[deploy.sh]${NC} Installing node dependencies..."
# ssh ${USER}@${IP} 'cd "/root/fishbot/Server" && npm install --production'
# echo "${PURPLE}[deploy.sh]${NC} ${GREEN}Installed${NC} dependencies"

# echo "${PURPLE}[deploy.sh]${NC} Pruning node dependencies..."
# ssh ${USER}@${IP} 'cd "/root/fishbot/Server" && npm prune --production'
# echo "${PURPLE}[deploy.sh]${NC} ${GREEN}Pruned${NC} node dependencies"


# # START ALL APPS
# # forever is used to manage and monitor all the apps
# # The forever configuration is read from forever.json
# echo "${PURPLE}[deploy.sh]${NC} Starting all apps using forever..."
# ssh ${USER}@${IP} 'forever start /root/fishbot/forever.json' 
# echo "${PURPLE}[deploy.sh]${NC} Listing all the started apps..."
# ssh ${USER}@${IP} 'forever list' 

# DONE
echo "${PURPLE}[deploy.sh]${NC} ${BLUE}=========================${NC}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE}      Done Deployment    ${NC}"
echo "${PURPLE}[deploy.sh]${NC} ${BLUE}=========================${NC}"