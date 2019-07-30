foam.CLASS({
  package: 'net.nanopay.dao',
  name: 'EasyDAO',
  extends: 'foam.dao.EasyDAO',
  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.dao.JournalType',
      name: 'journalType',
      value: 'NO_JOURNAL'
    },
    {
      class: 'Object',
      type: 'foam.dao.DAO',
      name: 'innerDAO',
      javaFactory: `
      if ( getJournalType().equals(JournalType.SINGLE_JOURNAL) )
        return new foam.dao.java.HashingJDAO(getX(), getOf(), getJournalName());
      return new foam.dao.MDAO(getOf());
      `
    }
  ],
  
  methods: [
    {
      name: 'getOuterDAO',
      documentation: 'Method to be overidden on the user end to add framework user specific DAO decorators to EasyDAO',
      type: 'foam.dao.DAO',
      args: [
        {
          type: 'foam.dao.DAO',
          name: 'innerDAO'
        }
      ],
      javaCode: `
        return innerDAO;
      `
    }
  ]
});