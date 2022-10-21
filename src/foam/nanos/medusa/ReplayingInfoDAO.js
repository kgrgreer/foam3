/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'ReplayingInfoDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Update ReplayingInfo on put',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM'
  ],

  properties: [
    {
      name: 'updateIndex',
      class: 'Boolean'
    }
  ],

  methods: [
    {
      name: 'put_',
      args: 'Context x, FObject obj',
      javaCode: `
      PM pm = PM.create(x, getClass().getSimpleName(), "put");
      try {
        synchronized ( this ) {
          MedusaEntry entry = (MedusaEntry) obj;
          ReplayingInfo info = (ReplayingInfo) x.get("replayingInfo");
          if ( info.getMinIndex() == 0L ) {
            info.setMinIndex(entry.getIndex());
          } 
          info.setMaxIndex(Math.max(info.getMaxIndex(), entry.getIndex()));
          info.setCount(info.getCount() + 1);
          if ( getUpdateIndex() ) {
            info.updateIndex(x, entry.getIndex());
          }
        }
        return getDelegate().put_(x, obj);
      } finally {
        pm.log(x);
      }
      `
    }
  ]
});
