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
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.approval.ApprovalRequestUtil',
    'foam.nanos.approval.ApprovalStatus',
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
            Logger logger = new PrefixLogger(new Object[] {"SudoTicketApprovalResponseAction"}, (Logger) x.get("logger"));
            SudoTicket ticket = (SudoTicket) obj;
            SudoTicket oldTicket = (SudoTicket) oldObj;
            SudoTicketApprovalResponseRule myRule = (SudoTicketApprovalResponseRule) rule;
            User user = (User) ticket.findOwner(x).fclone();
            DAO approvalDAO = ApprovalRequestUtil.getAllRequests(x, ticket.getId(), ApprovalRequestClassificationEnum.SUDO_TICKET_APPROVAL);
            ApprovalStatus status = ApprovalRequestUtil.getState(approvalDAO);
            if ( status == ApprovalStatus.APPROVED &&
                 oldTicket.getApprovalStatus() != ApprovalStatus.APPROVED &&
                 ! "CLOSED".equals(ticket.getStatus()) ) {
              ticket.setSavedGroup(user.getGroup());
              ticket.setApprovalStatus(status);

              user.setGroup(myRule.getAssignToGroup());
              user = (User) ((DAO) x.get("localUserDAO")).put(user).fclone();
              // clean up requsets
              ApprovalRequestUtil.getAllApprovalRequests(x, ticket.getId(), ApprovalRequestClassificationEnum.SUDO_TICKET_APPROVAL).removeAll();
            } else if ( status == ApprovalStatus.REJECTED &&
                        oldTicket.getApprovalStatus() == ApprovalStatus.REQUESTED ) {
              ApprovalRequest rejected = (ApprovalRequest) ((ArraySink)ApprovalRequestUtil.getAllRejectedRequests(x, ticket.getId(), ApprovalRequestClassificationEnum.SUDO_TICKET_APPROVAL).limit(1).select(new ArraySink())).getArray().get(0);
              TicketComment comment = new TicketComment();
              comment.setComment(rejected.getMemo());
              comment.setTicket(ticket.getId());
              ((DAO) x.get("localTicketCommentDAO")).put(comment);

              ticket.setApprovalStatus(status);
           } else if ( ( status == ApprovalStatus.REJECTED &&
                         oldTicket.getApprovalStatus() == ApprovalStatus.APPROVED ) ||
                       ( "CLOSED".equals(ticket.getStatus()) &&
                         ! "CLOSED".equals(oldTicket.getStatus()) ) ) {
              // reverse group assignment.
              if ( ! foam.util.SafetyUtil.isEmpty(ticket.getSavedGroup()) ) {
                user.setGroup(ticket.getSavedGroup());
                user = (User) ((DAO) x.get("localUserDAO")).put(user);
              }
              if ( status == ApprovalStatus.REJECTED &&
                   oldTicket.getApprovalStatus() == ApprovalStatus.APPROVED ) {
                ticket.setApprovalStatus(status);
              }
              // clean up requsets
              ApprovalRequestUtil.getAllApprovalRequests(x, ticket.getId(), ApprovalRequestClassificationEnum.SUDO_TICKET_APPROVAL).removeAll();
            }
          }
        }, "Sudo Ticket Approval Response");
      `
    }
 ]
});
