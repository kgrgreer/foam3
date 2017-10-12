sudo mkdir -p /usr/local
cd /usr/local
curl -o apache-tomcat-8.5.23.zip http://mirror.csclub.uwaterloo.ca/apache/tomcat/tomcat-8/v8.5.23/bin/apache-tomcat-8.5.23.zip
unzip apache-tomcat-8.5.23.zip
rm apache-tomcat-8.5.23.zip

sudo ln -s /usr/local/apache-tomcat-8.5.23 /Library/Tomcat
sudo chmod +x /Library/Tomcat/bin/*.sh

