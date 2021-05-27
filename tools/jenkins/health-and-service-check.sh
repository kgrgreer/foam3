#!/bin/bash
echo '--------------------------------------------------------------------------------'
echo '**************************** ca-central-development ****************************'
echo '--------------------------------------------------------------------------------'
echo 'ca-central-development-node1 - Service Status:'
ssh ca-central-development-node1 systemctl status nanopay
echo 'ca-central-development-node2 - Service Status:'
ssh ca-central-development-node2 systemctl status nanopay
echo 'ca-central-development-node3 - Service Status:'
ssh ca-central-development-node3 systemctl status nanopay
echo 'ca-central-development-node4 - Service Status:'
ssh ca-central-development-node4 systemctl status nanopay
echo 'ca-central-development-mediator1 - Service Status:'
ssh ca-central-development-mediator1 systemctl status nanopay
echo 'ca-central-development-mediator2 - Service Status:'
ssh ca-central-development-mediator2 systemctl status nanopay
echo 'ca-central-development.nanopay.net/service/health:'
echo '--------------------------------------------------------------------------------'
curl -IL -k --silent https://ca-central-development.nanopay.net/service/health | grep HTTP
echo 'https://treviso-ca-central-development.nanopay.net/service/health:'
curl -IL -k --silent https://treviso-ca-central-development.nanopay.net/service/health | grep HTTP
echo 'https://bepay-ca-central-development.nanopay.net/service/health:'
curl -IL -k --silent https://bepay-ca-central-development.nanopay.net/service/health | grep HTTP
echo 'https://intuit-ca-central-development.nanopay.net:'
curl -IL -k --silent https://intuit-ca-central-development.nanopay.net/service/health | grep HTTP
echo 'https://mediator1-ca-central-development.nanopay.net:8443/service/health:'
curl -IL -k --silent https://mediator1-ca-central-development.nanopay.net:8443/service/health | grep HTTP
echo 'https://mediator2-ca-central-development.nanopay.net:8443/service/health:'
curl -IL -k --silent https://mediator2-ca-central-development.nanopay.net:8443/service/health | grep HTTP
echo 'https://ca-central-development.nanopay.net:'
curl -IL -k --silent https://ca-central-development.nanopay.net | grep HTTP
echo 'https://treviso-ca-central-development.nanopay.net:'
curl -IL -k --silent https://treviso-ca-central-development.nanopay.net | grep HTTP
echo 'https://bepay-ca-central-development.nanopay.net:'
curl -IL -k --silent https://bepay-ca-central-development.nanopay.net | grep HTTP
echo 'https://intuit-ca-central-development.nanopay.net:'
curl -IL -k --silent https://intuit-ca-central-development.nanopay.net | grep HTTP
echo '--------------------------------------------------------------------------------'
