foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'DowJonesApprovalRequestRule',
  extends: 'net.nanopay.meter.compliance.dowJones.AbstractDowJonesComplianceRuleAction',

  documentation: 'Validates a user using DowJones Risk and Compliance API.',

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.approval.ApprovalRequest',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        DowJonesApprovalRequest approvalRequest = (DowJonesApprovalRequest) obj;
        DAO dowJonesResponseDAO = (DAO) x.get("dowJonesResponseDAO");

        DowJonesResponse dowJonesResponse = (DowJonesResponse) dowJonesResponseDAO.find(
          AND(
            EQ(DowJonesResponse.ID,      approvalRequest.getCauseId()),
            EQ(DowJonesResponse.USER_ID, Long.valueOf(approvalRequest.getObjId()))
          )
        );

        dowJonesResponse.setStatus(approvalRequest.getStatus());
        dowJonesResponse.setNotes(approvalRequest.getNotes());
        dowJonesResponseDAO.put(dowJonesResponse);
      `
    }
  ]
});
