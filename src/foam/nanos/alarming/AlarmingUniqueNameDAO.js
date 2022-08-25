/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.alarming',
  name: 'AlarmingUniqueNameDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.analytics.Candlestick'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Candlestick om = (Candlestick) obj;
        DAO omNameDAO = (DAO) x.get("omNameDAO");
        OMName existing = (OMName) omNameDAO.find((String)om.getKey());
        if ( existing == null ) {
          OMName name = new OMName.Builder(x)
            .setName((String)om.getKey())
            .build();
          omNameDAO.put(name);
        }
        return getDelegate().put(obj);
      `
    }
  ]

 });
