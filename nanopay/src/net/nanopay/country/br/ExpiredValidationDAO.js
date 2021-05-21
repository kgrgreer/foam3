/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.country.br',
  name: 'ExpiredValidationDAO',
  extends: 'foam.dao.FilteredDAO',

  documentation: 'Filter out expired CPF validations',

  implements: [
    'foam.mlang.Expressions'
  ],

  javaImports: [
    'foam.nanos.auth.CreatedAware',
    'java.util.Calendar',
    'java.util.Date'
  ],

  properties: [
		{
			class: 'Int',
			name: 'validityPeriod'
		}
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        CreatedAware obj = (CreatedAware) getDelegate().find_(x, id);
        if ( obj == null || obj.getCreated() == null ) return null;

        Date today = new Date();
        Calendar c = Calendar.getInstance();
        c.setTime(obj.getCreated());
        c.add(Calendar.DATE, getValidityPeriod());
        Date expireDate = c.getTime();
        if ( today.after(expireDate) ) return null;

        return (foam.core.FObject) obj;
      `
    },
    {
      name: 'select_',
      javaCode: `
        Date today = new Date();
        Calendar c = Calendar.getInstance();
        c.setTime(today);
        c.add(Calendar.DATE, -getValidityPeriod());
        Date d = c.getTime();

        return getDelegate()
          .where(foam.mlang.MLang.GTE(getOf().getAxiomByName("created"), d))
          .select_(x, sink, skip, limit, order, predicate);
      `
    }
  ],
});
