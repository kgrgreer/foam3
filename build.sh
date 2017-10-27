
cd /pkg/stack/stage/NANOPAY
./run-tomcat.sh

cd /pkg/stack/stage/NANOPAY
cp accounts /opt/tomcat/bin/
cp branches /opt/tomcat/bin/
cp bankAccounts /opt/tomcat/bin/
cp brokers /opt/tomcat/bin/
cp businesses /opt/tomcat/bin/
cp canadaTransactions /opt/tomcat/bin/
cp cicoServiceProviders /opt/tomcat/bin/
cp countries /opt/tomcat/bin/
cp countryAgents /opt/tomcat/bin/
cp cronjobs /opt/tomcat/bin/
cp currency /opt/tomcat/bin/
cp devices /opt/tomcat/bin/
cp dateofbirth /opt/tomcat/bin/
cp exchangeRates /opt/tomcat/bin/
cp exportDriverRegistrys /opt/tomcat/bin/
cp groups /opt/tomcat/bin/
cp historyRecords /opt/tomcat/bin/
cp indiaTransactions /opt/tomcat/bin/
cp identification /opt/tomcat/bin/
cp invoices /opt/tomcat/bin/
cp invoiceResolutions /opt/tomcat/bin/
cp languages /opt/tomcat/bin/
cp menus /opt/tomcat/bin/
cp pacs8india /opt/tomcat/bin/
cp pacs8iso /opt/tomcat/bin/
cp payees /opt/tomcat/bin/
cp permissions /opt/tomcat/bin/
cp regions /opt/tomcat/bin/
cp scripts /opt/tomcat/bin/
cp services /opt/tomcat/bin/
cp tests /opt/tomcat/bin/
cp transactions /opt/tomcat/bin/
cp users /opt/tomcat/bin/
cp -r foam2/ /opt/tomcat/bin/foam2
cp -r $(pwd) /opt/tomcat/bin/NANOPAY
cp target/ROOT.war /opt/tomcat/webapps

cd /opt/tomcat/bin
./shutdown.sh
./startup.sh
