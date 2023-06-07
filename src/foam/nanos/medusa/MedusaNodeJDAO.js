/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaNodeJDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Skip writing to underlying JDAO if only transient Data.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.FileRollCmd',
    'foam.dao.java.JDAO'
  ],

  properties: [
    {
      name: 'mdao',
      class: 'foam.dao.DAOProperty'
    }
  ],

  javaCode: `
    public MedusaNodeJDAO(foam.core.X x, foam.dao.DAO mdao, foam.dao.DAO jdao) {
      setX(x);
      setOf(foam.nanos.medusa.MedusaEntry.getOwnClassInfo());
      setMdao(mdao);
      setDelegate(jdao);
    }
  `,

  methods: [
    {
      documentation: `Only write non-trasient data to underlying jdao (journal). The jdao put will also update it's delegate - the mdao. Otherwise just update the mdao - with storageTransient data.`,
      name: 'put_',
      javaCode: `
      MedusaEntry entry = (MedusaEntry) obj;
      if ( ! foam.util.SafetyUtil.isEmpty(entry.getData()) ) {
        return getDelegate().put_(x, obj);
      }
      return getMdao().put_(x, obj);
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      foam.nanos.logger.Loggers.logger(x, this).debug("cmd",obj);
      if ( obj instanceof FileRollCmd ) {

        // Roll the JDAO's Journal
        // the reset delegate which will recreate the
        // the Journal, MessageDigest, and trigger replay

        obj = getDelegate().cmd_(x, obj);
        if ( obj != null &&
             foam.util.SafetyUtil.isEmpty(((FileRollCmd) obj).getError()) ) {
          ((DAO) x.get("medusaNodeDAO")).cmd_(x, DAO.PURGE_CMD);
          JDAO jdao = (JDAO) getDelegate();
          var delegate = jdao.getDelegate();
          jdao.clearDelegate();
          jdao.setDelegate(delegate);

          ReplayingInfo replaying = (ReplayingInfo) x.get("replayingInfo");
          replaying.clearCount();
        }
      } else if ( DAO.PURGE_CMD.equals(obj) ) {
        getMdao().cmd_(x, obj);
      }
      return obj;
      `
    }
  ]
});
