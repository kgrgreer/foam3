/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'SubdomainAwareDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO that adds value to subdomains property',

  javaImports: [
    'javax.servlet.http.HttpServletRequest'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( obj instanceof SubdomainAware ) {
          if ( ((SubdomainAware) obj).getSubdomain().isEmpty() ) {
            var host = x.get(HttpServletRequest.class).getServerName();
            ((SubdomainAware) obj).setSubdomain(host);
          }
        }
        return super.put_(x, obj);
      `
    }
  ]
});
