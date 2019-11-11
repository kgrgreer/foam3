/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.ticket.test',
  name: 'SudoTicketTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Group',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.ticket.Ticket',
    'foam.nanos.ticket.TicketStatus',
    'net.nanopay.approval.ApprovalRequest',
    'net.nanopay.approval.ApprovalRequestUtil',
    'net.nanopay.approval.ApprovalStatus',
    'net.nanopay.ticket.SudoTicket',
    'net.nanopay.ticket.SudoTicketApprovalRequestRule',
    'net.nanopay.ticket.SudoTicketApprovalResponseRule',
    'java.util.ArrayList',
    'java.util.Arrays'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
    // create two groups group1, group2
    // create three users user1, user2, user3
    // create a SudoTicketApprovalRequestRule with approver user1
    // create a SudoTicketApprovalRequestRule with group to switch to group2
    // create a SudoTicket user2, user3
    // test user2 had group1
    // test for approvalrequest
    // approve request
    // test user2 had group2
    // close ticket
    // test user2 had group1

    // repeat with declined.
    Logger logger = new PrefixLogger(new Object[] {"SudoTicketTest"}, (Logger) x.get("logger"));
    DAO groupDAO = (DAO) x.get("localGroupDAO");
    Group group1 = (Group) groupDAO.put(new Group.Builder(x).setId("group1").build());
    Group group2 = (Group) groupDAO.put(new Group.Builder(x).setId("group2").build());
    Group group3 = (Group) groupDAO.put(new Group.Builder(x).setId("group3").build());

    DAO userDAO = (DAO) x.get("localUserDAO");
    User user1 = (User) userDAO.put(new User.Builder(x).setGroup("group1").setFirstName("user_one").setLastName("user_one").setEmail("user1@nanopay.net").build());
    User user2 = (User) userDAO.put(new User.Builder(x).setGroup("group2").setFirstName("user_two").setLastName("user_two").setEmail("user2@nanopay.net").build());
    User user3 = (User) userDAO.put(new User.Builder(x).setGroup("group3").setFirstName("user_three").setLastName("user_three").setEmail("user3@nanopay.net").build());

    DAO ruleDAO = (DAO) x.get("ruleDAO");
    SudoTicketApprovalRequestRule requestRule = (SudoTicketApprovalRequestRule) ruleDAO.find("SudoTicketApprovalRequestRule").fclone();
    test(requestRule != null, "Request rule found");
    requestRule.setApprovers(new ArrayList(Arrays.asList(user1.getId())));
    requestRule = (SudoTicketApprovalRequestRule) ruleDAO.put(requestRule);
    test(requestRule.getApprovers().size() == 1, "RequestRule has 1 approver");
    test(requestRule.getApprovers().get(0) == user1.getId(), "RequestRule has approver user1");

    SudoTicketApprovalResponseRule responseRule = (SudoTicketApprovalResponseRule) ruleDAO.find("SudoTicketApprovalResponseRule").fclone();
    test(responseRule != null, "Response rule found");
    responseRule.setAssignToGroup(group3.getId());
    responseRule = (SudoTicketApprovalResponseRule) ruleDAO.put(responseRule);
    test(responseRule.getAssignToGroup() == group3.getId(), "Response rule group 3");
 
   DAO ticketDAO = (DAO) x.get("localTicketDAO");
   SudoTicket ticket = new SudoTicket.Builder(x).setOwner(user2.getId()).setSudoAsUser(user3.getId()).setComment("user2 as user3").build();
   X y = x.put("user", user2);
   ticket = (SudoTicket) ticketDAO.inX(y).put_(y, ticket).fclone();

   String classification = SudoTicket.class.getSimpleName();
   DAO approvalRequestDAO = ApprovalRequestUtil.getAllRequests(x, ticket.getId(), classification);
   ApprovalStatus status = ApprovalRequestUtil.getState(approvalRequestDAO);
   test(status != null, "ApprovalRequest found.");
   test(status == ApprovalStatus.REQUESTED, "ApprovalRequest REQUESTED");

   ApprovalRequest request = (ApprovalRequest) ((FObject)((ArraySink)ApprovalRequestUtil.getAllApprovalRequests(x, ticket.getId(), classification).limit(1).select(new ArraySink())).getArray().get(0)).fclone();
   request.setStatus(ApprovalStatus.APPROVED);
   approvalRequestDAO.put(request);

   status = ApprovalRequestUtil.getState(approvalRequestDAO);
   test(status == ApprovalStatus.APPROVED, "ApprovalRequest APPROVED");
   // yield to allow aysnc ops to run.
   try {
     logger.debug("sleeping");
     Thread.currentThread().sleep(1000);
   } catch (InterruptedException e) {
     //nop
   }

   user2 = (User) userDAO.find(user2.getId());
   test( user2.getGroup() == group3.getId(), "User2 group changed to group3 ("+user2.getGroup()+")");

   ticket = (SudoTicket) ticketDAO.find_(y, ticket.getId()).fclone();
   ticket.setStatus(TicketStatus.CLOSED);
   ticket = (SudoTicket) ticketDAO.put_(y, ticket);
   test( ticket.getStatus() == TicketStatus.CLOSED, "Ticket closed");

   // yield to allow aysnc ops to run.
   try {
     logger.debug("sleeping");
     Thread.currentThread().sleep(1000);
   } catch (InterruptedException e) {
     //nop
   }

   user2 = (User) userDAO.find(user2.getId());
   test( user2.getGroup() == group2.getId(), "User2 group changed to group2 ("+user2.getGroup()+")");

   // TODO: 1) REQUESTED -> DECLINED, 2) APPROVED -> DECLINED
     ` 
    }
  ]
});
