foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'AbstractDowJonesComplianceRuleAction',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'java.util.Date',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'fetchLastExecutionDate',
      type: 'Date',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'searchId',
          type: 'Long'
        },
        {
          name: 'searchType',
          type: 'String',
        }
      ],
      javaCode: `
        DAO dowJonesResponseDAO = (DAO) x.get("dowJonesResponseDAO");
        ArraySink sink = (ArraySink) dowJonesResponseDAO.where(
          AND(
            EQ(DowJonesResponse.USER_ID, searchId),
            EQ(DowJonesResponse.SEARCH_TYPE, searchType),
            LT(DowJonesResponse.SEARCH_DATE, new Date()),
            GT(DowJonesResponse.TOTAL_MATCHES, 0)
          )
        ).orderBy(DESC(DowJonesResponse.SEARCH_DATE)).limit(1).select(new ArraySink());

        if ( sink.getArray().size() > 0 ) {
          DowJonesResponse dowJonesResponse = (DowJonesResponse) sink.getArray().get(0);
          return dowJonesResponse.getSearchDate();
        }
        return null;
      `
    },
    {	
      name: 'applyAction',	
      javaCode: ` `	
    }
  ]
});
