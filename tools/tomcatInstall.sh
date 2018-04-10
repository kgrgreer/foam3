#!/bin/sh

sudo mkdir -p /usr/local
cd /usr/local
sudo curl -o apache-tomcat-8.5.30.zip http://mirror.csclub.uwaterloo.ca/apache/tomcat/tomcat-8/v8.5.30/bin/apache-tomcat-8.5.30.zip
sudo unzip apache-tomcat-8.5.30.zip
sudo rm apache-tomcat-8.5.30.zip
sudo rm -rf /Library/Tomcat
sudo ln -s /usr/local/apache-tomcat-8.5.29 /Library/Tomcat
sudo chmod +x /Library/Tomcat/bin/*.sh
cd /Library/Tomcat
sudo rm -rf webapps/
sudo mkdir webapps/
sudo chown -R $USER /Library/Tomcat/
