/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.ticket',
  name: 'SudoTicketApprovalRequestAction',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.ticket.Ticket',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalRequestUtil',
    'net.nanopay.approval.ApprovalStatus',
    'java.util.List'
  ],

  properties: [
    {
      name: 'daoKey',
      class: 'String',
      value: 'localTicketDAO'
    },
    {
      name: 'classification',
      class: 'String',
      value: 'SudoTicket'
    }
  ],
  
  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Logger logger = new PrefixLogger(new Object[] {this.getClass().getSimpleName()}, (Logger) x.get("logger"));
            SudoTicketApprovalRequestRule myRule = (SudoTicketApprovalRequestRule) rule;
            if ( myRule.getApprovers().size() == 0 ) {
              logger.warning("no approvers configured.");
              return;
            }
            SudoTicket ticket = (SudoTicket) obj; //.fclone();
            DAO approvalDAO = ApprovalRequestUtil.getAllRequests(x, ticket.getId(), getClassification());

            ApprovalStatus status = ApprovalRequestUtil.getState(approvalDAO);
            logger.debug("ApprovalStatus", status);
            if ( status == null ) {
              DAO userDAO = (DAO) x.get("localUserDAO");
              User owner = ticket.findOwner(x);
              User as = ticket.findSudoAsUser(x);
              ApprovalRequest approval = new ApprovalRequest.Builder(x)
                .setObjId(ticket.getId())
                .setDaoKey(getDaoKey())
                .setClassification(getClassification())
                .setDescription(owner.getLegalName()+" request access to "+as.getLegalName())
                .build();
              for ( Long approverId : myRule.getApprovers() ) {
                ApprovalRequest request = (ApprovalRequest) approval.fclone();
                request.setApprover(approverId);
                request = (ApprovalRequest) approvalDAO.put_(x, request);
                logger.debug("created approval request", request);
             }
           }
         }
       }, "Sudo Ticket Approval Request");
      `
    }
 ]
});
