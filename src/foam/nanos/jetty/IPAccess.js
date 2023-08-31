/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.jetty',
  name: 'IPAccess',

  documentation: `
See: https://git.eclipse.org/c/jetty/org.eclipse.jetty.project.git/tree/jetty-server/src/main/java/org/eclipse/jetty/server/handler/IPAccessHandler.java
Examples of the entry specifications are:
<ul>
 <li>10.10.1.2 - all requests from IP 10.10.1.2
 <li>10.10.1.2|/foo/bar - all requests from IP 10.10.1.2 to URI /foo/bar
 <li>10.10.1.2|/foo/* - all requests from IP 10.10.1.2 to URIs starting with /foo/
 <li>10.10.1.2|*.html - all requests from IP 10.10.1.2 to URIs ending with .html
 <li>10.10.0-255.0-255 - all requests from IPs within 10.10.0.0/16 subnet
 <li>10.10.0-.-255|/foo/bar - all requests from IPs within 10.10.0.0/16 subnet to URI /foo/bar
 <li>10.10.0-3,1,3,7,15|/foo/* - all requests from IPs addresses with last octet equal
                                  to 1,3,7,15 in subnet 10.10.0.0/22 to URIs starting with /foo/
 </ul>
`,

  properties: [
    {
      documentation: `IP address and url.`,
      class: 'String',
      name: 'id',
      label: 'from',
      updateVisibility: 'RO'
    },
    {
      class: 'Boolean',
      name: 'block',
      value: true
    }
  ]
});
