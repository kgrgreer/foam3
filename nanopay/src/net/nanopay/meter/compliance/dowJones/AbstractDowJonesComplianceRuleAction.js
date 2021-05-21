/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
