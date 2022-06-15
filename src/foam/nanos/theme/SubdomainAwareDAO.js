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
    'foam.dao.DAO'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( obj instanceof SubdomainAware ) {
          if ( ( (SubdomainAware) obj).getSubdomain().isEmpty() ) {
            var theme = ((Themes) x.get("themes")).findTheme(x);
            var themedomain = ((DAO) x.get("themeDomainDAO")).find(theme);
            if (themedomain != null) ((SubdomainAware) obj).setSubdomain(((ThemeDomain) themedomain).getSubdomain());
          }
        }
        return super.put_(x, obj);
      `
    }
  ]
});
