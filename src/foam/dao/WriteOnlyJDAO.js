/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'WriteOnlyJDAO',
  extends: 'foam.dao.java.JDAO',

  javaCode: `
    public WriteOnlyJDAO(foam.core.X x, foam.core.ClassInfo classInfo, String filename) {
      this(x, new foam.dao.NullDAO(), classInfo, filename);
    }

    public WriteOnlyJDAO(foam.core.X x, foam.dao.DAO delegate, foam.core.ClassInfo classInfo, String filename) {
      setX(x);
      setOf(classInfo);
      setFilename(filename);
      setDelegate(delegate);

      // create journal
      setJournal(new foam.dao.WriteOnlyF3FileJournal.Builder(x)
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
      javaPostSet: ' // noop '
    }
  ]
});
