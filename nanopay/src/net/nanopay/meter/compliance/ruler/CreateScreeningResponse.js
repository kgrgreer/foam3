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
  package: 'net.nanopay.meter.compliance.ruler',
  name: 'CreateScreeningResponse',

  documentation: 'Creates a record in counterDAO',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.*',
    'net.nanopay.meter.compliance.dowJones.DowJonesResponse',
    'net.nanopay.meter.compliance.dowJones.Match',
    'net.nanopay.meter.report.ScreeningResponseCounter',
    'net.nanopay.meter.report.ScreeningResponseType',
    'static foam.mlang.MLang.EQ'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        try {
          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              DowJonesResponse response = (DowJonesResponse) obj;

              if ( response.getUserId() == 0 ) return;

              DAO counterDAO = (DAO) x.get("counterDAO");
              counterDAO.where(EQ(ScreeningResponseCounter.USER_ID, response.getUserId())).removeAll();
              Match[] matches = response.getResponseBody().getMatches();
              Set<String> uniqueIcons = new HashSet<String>();
              for ( Match match : matches ) {
                String[] riskIcons = match.getPayload().getRiskIcons();
                for (String riskIcon : riskIcons ) {
                  if ( SafetyUtil.equals(riskIcon, "") ) continue;
                  uniqueIcons.add(riskIcon);
                }
              }
              for ( String icon: uniqueIcons ) {
                ScreeningResponseCounter counter = new ScreeningResponseCounter();
                counter.setUserId(response.getUserId());
                counter.setKey(getResponseType(icon));
                counter.setName("screening_response");
                counterDAO.put(counter);
              }
            }
          }, "Create Remove Compliance Item Rule");
        } catch (Exception e) {
          Logger logger = (Logger) x.get("logger");
          logger.error("CreateRemoveComplianceItemRule Error: ", e);
        }
      `
    },
    {
      name: 'getResponseType',
      type: 'net.nanopay.meter.report.ScreeningResponseType',
      args: [ { name: 'icon', type: 'String' } ],
      javaCode: `
      for ( ScreeningResponseType type : ScreeningResponseType.values() ) {
        if ( type.getName().equals(icon) ) return type;
      }
      return ScreeningResponseType.OTHER;
      `
    }
  ]
});
