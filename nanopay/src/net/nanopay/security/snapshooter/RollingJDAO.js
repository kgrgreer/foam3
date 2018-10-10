foam.CLASS({
  package: 'net.nanopay.security.snapshooter',
  name: 'RollingJDAO',
  extends: 'foam.dao.java.JDAO',

  documentation: `This JDAO adds the service name to the JDAO, enabling the
    RollingJournal to use the service name for appending it to the the journal
    records for a single journal file.`,

  properties: [
    {
      class: 'String',
      name: 'service',
      documentation: 'Name of the service.'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          public RollingJDAO(foam.core.X x, foam.dao.DAO delegate, foam.dao.Journal journal) {
            setX(x);
            setOf(delegate.getOf());
            setDelegate(delegate);
            setJournal(journal);
          }
        `);
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      return super.put_(x.put("service", getService()), obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
      return super.remove_(x.put("service", getService()), obj);
      `
    }
   ]
  })
