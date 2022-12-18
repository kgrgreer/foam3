/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaInternalDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Manage access to internal MedusaEntry DAO.
Presently we have data loss when both the local and non-local MedusaEntry
DAO stacks both end at x.get("internalMedusaEntryDAO").
Update: it appears there are multiple DAOs in the context.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.Sink',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.GT',
    'static foam.mlang.MLang.GTE',
    'static foam.mlang.MLang.LT',
    'static foam.mlang.MLang.LTE',
    'static foam.mlang.MLang.NOT',
    'foam.mlang.sink.Count',
    'foam.mlang.sink.Sequence',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers'
  ],

  properties: [
    {
      name: 'dao',
      class: 'foam.dao.DAOProperty',
      javaFactory: `
      DAO dao = (DAO) getX().get("internalMedusaDAO");
      setDelegate(dao);
      return dao;
      `
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
      return getDao().find_(x, id);
      `
    },
    {
      name: 'select_',
      javaCode: `
      return getDao().select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'put_',
      javaCode: `
      return getDelegate().put_(x, getDao().put_(x, obj));
      `
    },
    {
      name: 'cmd_',
      javaCode: `
      if ( obj instanceof MedusaEntryPurgeCmd ) {
        MedusaEntryPurgeCmd cmd = (MedusaEntryPurgeCmd) obj;
        DAO dao = this.where(
          AND(
            GTE(MedusaEntry.INDEX, cmd.getMinIndex()),
            LTE(MedusaEntry.INDEX, cmd.getMaxIndex()),
            EQ(MedusaEntry.PROMOTED, true)
          )
        );

        Count count = new Count();
        Sink sink = new PurgeSink(x, new foam.dao.RemoveSink(x, dao));
        Sequence seq = new Sequence.Builder(x)
          .setArgs(new Sink[] {count, sink})
          .build();
        dao.select(seq);
        cmd.setPurged((Long)count.getValue());
        if ( ((Long)count.getValue()) > 0 ) {
          Loggers.logger(x, this, "cmd, MedusaEntryPurgeCmd, purged").info(count.getValue());
        }
        return cmd;
      }
      return obj;
      `
    }
  ]
});
