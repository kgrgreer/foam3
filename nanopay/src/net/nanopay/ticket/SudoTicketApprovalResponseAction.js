/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.ticket',
  name: 'SudoTicketApprovalResponseAction',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Manipulate requesting users group to give them appropriate access to view the users data.`,
  
  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.ticket.Ticket',
    'foam.nanos.ticket.TicketComment',
    'foam.nanos.ticket.TicketStatus',
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
            SudoTicket ticket = (SudoTicket) obj; 
            SudoTicket oldTicket = (SudoTicket) oldObj;
            SudoTicketApprovalResponseRule myRule = (SudoTicketApprovalResponseRule) rule;
            User user = (User) ticket.findOwner(x).fclone();
            DAO approvalDAO = ApprovalRequestUtil.getAllRequests(x, ticket.getId(), getClassification());
            ApprovalStatus status = ApprovalRequestUtil.getState(approvalDAO);
logger.debug("ApprovalStatus", status);
logger.debug("ticket.approvalStatus", ticket.getApprovalStatus());
logger.debug("oldTicket.approvalStatus", oldTicket.getApprovalStatus());
logger.debug("ticket.status", ticket.getStatus());
logger.debug("oldTicket.status", oldTicket.getStatus());

            ticket.setApprovalStatus(status);
            if ( status == ApprovalStatus.APPROVED &&
                 oldTicket.getApprovalStatus() != ApprovalStatus.APPROVED &&
                 ticket.getStatus() != TicketStatus.CLOSED ) {
logger.debug("BLOCK 1", Thread.currentThread().getId());
logger.debug("user.group",user.getGroup());
logger.debug("rule.assignToGroup",myRule.getAssignToGroup());
logger.debug("ticket.savedGroup", ticket.getSavedGroup());
              ticket.setSavedGroup(user.getGroup());
              ticket.setApprovalStatus(status);
              ticket = (SudoTicket) ((DAO) x.get(getDaoKey())).put(ticket);
logger.debug("ticket.setSavedGroup", ticket.getSavedGroup());

logger.debug("saving user group");
              user.setGroup(myRule.getAssignToGroup());
              user = (User) ((DAO) x.get("localUserDAO")).put(user).fclone();
              // clean up requsets
              ApprovalRequestUtil.getAllApprovalRequests(x, ticket.getId(), getClassification()).removeAll();
            } else if ( status == ApprovalStatus.REJECTED &&
                        oldTicket.getApprovalStatus() == ApprovalStatus.REQUESTED ) {
logger.debug("BLOCK 2", Thread.currentThread().getId());

              ApprovalRequest rejected = (ApprovalRequest) ((ArraySink)ApprovalRequestUtil.getAllRejectedRequests(x, ticket.getId(), getClassification()).limit(1).select(new ArraySink())).getArray().get(0);
              TicketComment comment = new TicketComment();
              comment.setComment(rejected.getMemo());
              comment.setTicket(ticket.getId());
              ((DAO) x.get("localTicketCommentDAO")).put(comment);

              ticket.setApprovalStatus(status);
              ((DAO) x.get(getDaoKey())).put(ticket);
           } else if ( status == ApprovalStatus.REJECTED &&
                 oldTicket.getApprovalStatus() == ApprovalStatus.APPROVED ||
                 ticket.getStatus() == TicketStatus.CLOSED &&
                 oldTicket.getStatus() != TicketStatus.CLOSED ) {
logger.debug("BLOCK 3", Thread.currentThread().getId());

              // reverse group assignment.
              user.setGroup(ticket.getSavedGroup());
              user = (User) ((DAO) x.get("localUserDAO")).put(user);
logger.debug("reverse group on user", user.getId(),user.getGroup(), ticket.getSavedGroup());

              ticket.setApprovalStatus(status);
              ((DAO) x.get(getDaoKey())).put(ticket);
            }
          }
        }, "Sudo Ticket Approval Response");
      `
    }
 ]
});
