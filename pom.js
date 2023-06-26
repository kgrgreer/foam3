/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
    name: "foam-full",
    version: 3,
    excludes: ['node_modules'],
    projects: [
        { name: "src/pom" },
        { name: 'src/foam/demos/u2/AllViews' },
        { name: 'src/foam/nanos/pom' },
        { name: "src/foam/u2/wizard/pom" },
        { name: "src/foam/flow/laminar/pom" }
    ],
    javaDependencies: [
      'com.authy:authy-java:1.1.0',
      'com.google.api-client:google-api-client:1.22.0',
      'com.google.apis:google-api-services-drive:v3-rev72-1.22.0',
      'com.google.apis:google-api-services-sheets:v4-rev567-1.22.0',
      'com.google.oauth-client:google-oauth-client-jetty:1.22.0 -org.mortbay.jetty',
      'com.google.oauth-client:google-oauth-client-jetty:1.22.0',
      'commons-codec:commons-codec:1.15',
      'commons-io:commons-io:2.13.0',
      'commons-lang:commons-lang:2.6',
      'io.methvin:directory-watcher:0.9.10',
      'javax.json:javax.json-api:1.0',
      'javax.mail:javax.mail-api:1.6.2',
      'javax.mail:mail:1.4.7',
      'javax.servlet:javax.servlet-api:3.1.0',
      'javax.websocket:javax.websocket-api:1.1',
      'javax.ws.rs:javax.ws.rs-api:2.1.1',
      'jstl:jstl:1.2',
      'org.apache-extras.beanshell:bsh:2.0b6',
      'org.apache.commons:commons-dbcp2:2.0.1',
      'org.apache.commons:commons-lang3:3.12.0',
      'org.apache.commons:commons-pool2:2.6.2',
      'org.apache.commons:commons-text:1.10.0',
      'org.apache.xmlgraphics:batik-codec:1.14',
      'org.apache.xmlgraphics:batik-transcoder:1.14',
      'org.bouncycastle:bcpg-jdk15on:1.64',
      'org.bouncycastle:bcpkix-jdk15on:1.64',
      'org.bouncycastle:bcprov-jdk15on:1.64',
      'org.java-websocket:Java-WebSocket:1.5.0',
      'org.jtwig:jtwig-core:5.87.0.RELEASE',
      'org.mongodb:mongodb-driver:3.4.2',
      'org.postgresql:postgresql:42.3.8',
     'com.twilio.sdk:twilio:7.50.1'
    ]
});
