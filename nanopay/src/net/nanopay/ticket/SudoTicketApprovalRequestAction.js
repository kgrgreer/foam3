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
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.ticket.Ticket',
    'foam.nanos.approval.ApprovalRequest',
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
            Logger logger = new PrefixLogger(new Object[] {this.getClass().getSimpleName()}, (Logger) x.get("logger"));
            SudoTicketApprovalRequestRule myRule = (SudoTicketApprovalRequestRule) rule;
            if ( myRule.getApprovers().size() == 0 ) {
              logger.warning("no approvers configured.");
              return;
            }
            SudoTicket ticket = (SudoTicket) obj; //.fclone();
            DAO approvalDAO = ApprovalRequestUtil.getAllRequests(x, ticket.getId(), ApprovalRequestClassificationEnum.SUDO_TICKET_APPROVAL);

            ApprovalStatus status = ApprovalRequestUtil.getState(approvalDAO);
            logger.debug("ApprovalStatus", status);
            if ( status == null ) {
              DAO userDAO = (DAO) x.get("localUserDAO");
              User owner = ticket.findOwner(x);
              User as = ticket.findSudoAsUser(x);
              ApprovalRequest approval = new ApprovalRequest.Builder(x)
                .setObjId(ticket.getId())
                .setDaoKey(getDaoKey())
                .setClassificationEnum(ApprovalRequestClassificationEnum.SUDO_TICKET_APPROVAL)
                .setDescription(owner.getLegalName() + " request access to " + as.getLegalName())
                .setCreatedFor(owner.getId())
                .build();
              for ( Long approverId : myRule.getApprovers() ) {
                ApprovalRequest request = (ApprovalRequest) approval.fclone();
                request.setApprover(approverId);
                request = (ApprovalRequest) approvalDAO.put_(x, request);
             }
           }
         }
       }, "Sudo Ticket Approval Request");
      `
    }
 ]
});
