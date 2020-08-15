/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.country',
  name: 'PermittedCountryFilterDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `Filters country for business country availability`,

  javaImports: [
    'foam.nanos.auth.Country',
    'foam.mlang.predicate.Predicate',
    'static foam.mlang.MLang.IN'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'permittedCountries'
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PermittedCountryFilterDAO(String[] countries, foam.core.X x, foam.dao.DAO delegate) {
            setPermittedCountries(countries);
            setDelegate(delegate);
          }
        `);
      },
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        Country country = (Country) getDelegate().find_(x, id);
        for ( String c : getPermittedCountries() ) {
          if ( c.equals(country.getCode()) ) {
            return country;
          }
        }
        return null;
      `
    },
    {
      name: 'select_',
      javaCode: `
        Predicate pred = IN(Country.CODE, getPermittedCountries());
        return getDelegate().select_(x, sink, skip, limit, order, pred);
      `
    }
  ]
});
