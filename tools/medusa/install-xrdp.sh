#!/bin/bash
exec 4<$1
while read -u4 m; do
    echo $m
    ssh $m "sudo apt-get -y install xrdp xfce4 xfce4-terminal; sudo sed -i.bak '/fi/a #xrdp multiple users configuration \n xfce-session \n' /etc/xrdp/startwm.sh; sudo adduser xrdp ssl-cert; sudo ufw allow 3389/tcp; sudo /etc/init.d/xrdp restart"
done
