foam.CLASS({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'DowJonesApprovalRequestRule',

  documentation: 'Rule to progagate data from the approval request to the corresponding Dow Jones Response.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

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
    },
    {
      name: 'applyReverseAction',
      javaCode: ` `
    },
    {
      name: 'canExecute',
      javaCode: `
      // TODO: add an actual implementation
      return true;
      `
    },
    {
      name: 'describe',
      javaCode: `
      // TODO: add an actual implementation
      return "";
      `
    }
  ]
});
