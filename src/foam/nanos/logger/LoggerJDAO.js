/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.logger',
  name: 'LoggerJDAO',
  extends: 'foam.dao.java.JDAO',

  documentation: `Only write to underlying JDAO if not PRODUCTION mode`,

  javaImports: [
    'foam.dao.MDAO'
  ],

  javaCode: `
    public LoggerJDAO(foam.core.X x, foam.dao.DAO delegate, foam.core.ClassInfo classInfo, String filename) {
      setX(x);
      setOf(classInfo);
      setFilename(filename);
      setDelegate(delegate);

      // create journal
      setJournal(new foam.nanos.logger.LoggerJournal.Builder(x)
        .setFilename(filename)
        .setCreateFile(true)
        .setDao(getDelegate())
        .setLogger(new foam.nanos.logger.PrefixLogger(new Object[] { "[JDAO]", filename }, foam.nanos.logger.StdoutLogger.instance()))
        .build());
    }
  `,

  properties: [
    {
      documentation: `Overwrite JDAO delegate to make javaPostSet a noop so when class is decorated by PipelinePMDAO the parent JDAO javaPostSet, which again calculates the 'journal' is not run.`,
      name: 'delegate',
      class: 'foam.dao.DAOProperty',
      javaFactory: 'return new MDAO(getOf());',
      javaPostSet: ' // noop'
    }
  ],

  methods: [
    {
      documentation: `Override JDAO removeAll which will remove all from journal, then mdao. We only want the mdao to be purged.`,
      name: 'removeAll_',
      javaCode: `
        getDelegate().select_(x, new foam.dao.RemoveSink(x, getDelegate()), skip, limit, order, predicate);
      `
    }
  ]
});
