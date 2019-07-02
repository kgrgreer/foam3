foam.CLASS({
  package: 'net.nanopay.meter.compliance.identityMind',
  name: 'AbstractIdentityMindComplianceRuleAction',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.HashMap',
    'java.util.Map',
    'net.nanopay.meter.compliance.dowJones.DowJonesResponse',
    'net.nanopay.meter.compliance.secureFact.sidni.SIDniResponse',
    'net.nanopay.meter.compliance.secureFact.lev.LEVResponse',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'fetchDowJonesMatches',
      type: 'Integer',
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
          type: 'String'
        }
      ],
      javaCode: `
        DAO dowJonesResponseDAO = (DAO) x.get("dowJonesResponseDAO");
        ArraySink sink = (ArraySink) dowJonesResponseDAO.where(
          AND(
            EQ(DowJonesResponse.USER_ID, searchId),
            EQ(DowJonesResponse.SEARCH_TYPE, searchType)
          )
        ).orderBy(DESC(DowJonesResponse.SEARCH_DATE)).limit(1).select(new ArraySink());
        DowJonesResponse response = sink.getArray().size() > 0 ? (DowJonesResponse) sink.getArray().get(0) : null;
        return response != null ? response.getTotalMatches() : 0;
      `
    },
    {
      name: 'fetchSecureFactSIDniResult',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'searchId',
          type: 'Long'
        }
      ],
      javaCode: `
        DAO securefactSIDniDAO = (DAO) x.get("securefactSIDniDAO");
        SIDniResponse response = (SIDniResponse) securefactSIDniDAO.find(
          EQ(SIDniResponse.ENTITY_ID, searchId)
        );
        return response != null ? response.getVerified() : false;
      `
    },
    {
      name: 'fetchSecureFactLEVResult',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'searchId',
          type: 'Long'
        }
      ],
      javaCode: `
        DAO securefactLEVDAO = (DAO) x.get("securefactLEVDAO");
        LEVResponse response = (LEVResponse) securefactLEVDAO.find(
            EQ(LEVResponse.ENTITY_ID, searchId)
        );
        return response != null ? response.hasCloseMatches() : false;
      `
    },
    {
      name: 'fetchMemos',
      type: 'Map',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'isConsumer',
          type: 'Boolean'
        },
        {
          name: 'searchId',
          type: 'Long'
        },
        {
          name: 'searchType',
          type: 'String'
        }
      ],
      javaCode: `
        Map<String, Object> memoMap = new HashMap<String, Object>();
        Integer dowJonesMatches = fetchDowJonesMatches(x, searchId, searchType);
        memoMap.put("memo3", dowJonesMatches);
        if ( isConsumer ) {
          Boolean SIDniResult = fetchSecureFactSIDniResult(x, searchId);
          memoMap.put("memo4", SIDniResult);
        } else {
          Boolean LEVResult = fetchSecureFactLEVResult(x, searchId);
          memoMap.put("memo5", LEVResult);
        }
        return memoMap;
      `
    },
    {
      name: 'applyAction',
      javaCode: ` `
    }
  ]
});
