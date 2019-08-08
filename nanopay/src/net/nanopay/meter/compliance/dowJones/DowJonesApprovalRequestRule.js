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
