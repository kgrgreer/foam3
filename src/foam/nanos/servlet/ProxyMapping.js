/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.servlet',
  name: 'ProxyMapping',

  documentation: `See https://archive.eclipse.org/jetty/9.2.10.v20150310/apidocs/org/eclipse/jetty/proxy/ProxyServlet.Transparent.html`,

  properties: [
    {
      class: 'String',
      name: 'pathSpec'
    },
    {
      documentation: 'leading portion of path to remove.',
      class: 'String',
      name: 'prefix'
    },
    {
      class: 'String',
      name: 'proxyTo'
    }
  ]
});
