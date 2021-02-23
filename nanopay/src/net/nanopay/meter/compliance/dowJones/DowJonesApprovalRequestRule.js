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
  name: 'DowJonesApprovalRequestRule',

  documentation: 'Rule to progagate data from the approval request to the corresponding Dow Jones Response.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequest',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        DowJonesApprovalRequest approvalRequest = (DowJonesApprovalRequest) obj;
        DAO dowJonesResponseDAO = (DAO) x.get("dowJonesResponseDAO");

        DowJonesResponse dowJonesResponse = (DowJonesResponse) dowJonesResponseDAO.find(
            EQ(DowJonesResponse.ID,      approvalRequest.getCauseId())
        );

        final DowJonesResponse dowJonesResponse_ = (DowJonesResponse) dowJonesResponse.fclone();
        dowJonesResponse_.setStatus(approvalRequest.getStatus());
        dowJonesResponse_.setComments(approvalRequest.getComments());

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO downJonesResponseDAO = (DAO) x.get("dowJonesResponseDAO");
            downJonesResponseDAO.put(dowJonesResponse_);
          }
        }, "Dow Jones Approval Request Rule");
      `
    }
  ]
});
