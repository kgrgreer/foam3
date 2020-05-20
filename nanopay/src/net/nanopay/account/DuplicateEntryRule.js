foam.CLASS({
  package: 'net.nanopay.account',
  name: 'DuplicateEntryRule',
  extends: 'foam.nanos.ruler.action.AbstractCheckDAOforMatching',

  documentation: `do a dao call to return an object matching the properties specified by an input. `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.mlang.sink.Count',
    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'ERROR_MESSAGE', message: 'An entry with the same details already exists' }
  ],

  methods: [
    {
      name: 'cmd',
      javaCode: `
        Count count = (Count) dao
        .where(
          EQ(nu.getClassInfo().getAxiomByName("deleted"), false)
        )
        .select(new Count());
        if ( count.getValue() != 0 )
          throw new RuntimeException(ERROR_MESSAGE);
      `
    },
  ]
});
