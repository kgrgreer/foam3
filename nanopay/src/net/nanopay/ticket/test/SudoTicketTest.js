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
  package: 'net.nanopay.ticket.test',
  name: 'SudoTicketTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.approval.ApprovalRequest',
    'foam.nanos.approval.ApprovalRequestClassificationEnum',
    'foam.nanos.approval.ApprovalRequestUtil',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.GroupPermissionJunction',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.session.Session',
    'foam.nanos.ticket.Ticket',
    'foam.nanos.ticket.TicketStatus',
    'foam.util.Auth',
    'java.util.ArrayList',
    'java.util.Arrays',
    'net.nanopay.ticket.SudoTicket',
    'net.nanopay.ticket.SudoTicketApprovalRequestRule',
    'net.nanopay.ticket.SudoTicketApprovalResponseRule',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      name: 'spid',
      class: 'String',
      javaFactory: 'return java.util.UUID.randomUUID().toString().toLowerCase().split("-")[0];'
    }
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
    ((DAO) x.get("localServiceProviderDAO")).put(new ServiceProvider.Builder(x).setId(getSpid()).build());

    DAO groupDAO = (DAO) x.get("localGroupDAO");
    Group group1 = (Group) groupDAO.put(new Group.Builder(x).setId("group1").build());
    Group group2 = (Group) groupDAO.put(new Group.Builder(x).setId("group2").build());
    Group group3 = (Group) groupDAO.put(new Group.Builder(x).setId("group3").build());

    DAO groupPermissionJunctionDAO = (DAO) x.get("localGroupPermissionJunctionDAO");
    groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("group1").setTargetId("serviceprovider.read."+getSpid()).build());
    groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("group2").setTargetId("serviceprovider.read."+getSpid()).build());
    groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("group3").setTargetId("serviceprovider.read."+getSpid()).build());
    groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("group2").setTargetId("group.read.group3").build());

    DAO userDAO = (DAO) x.get("localUserDAO");

    User admin = new User.Builder(x)
       .setId(99195)
       .setEmail("test@example.com")
       .setSpid(getSpid())
       .setGroup("admin")
       .setLifecycleState(LifecycleState.ACTIVE)
       .build();
    admin = (User) userDAO.put(admin);
    x = Auth.sudo(x, admin);
    userDAO = userDAO.inX(x);

    User user1 = (User) userDAO.put(new User.Builder(x).setGroup("group1").setFirstName("user_one").setLastName("user_one").setEmail("user1@nanopay.net").build());
    User user2 = (User) userDAO.put(new User.Builder(x).setGroup("group2").setFirstName("user_two").setLastName("user_two").setEmail("user2@nanopay.net").build());
    User user3 = (User) userDAO.put(new User.Builder(x).setGroup("group3").setFirstName("user_three").setLastName("user_three").setEmail("user3@nanopay.net").build());

    DAO ruleDAO = (DAO) x.get("localRuleDAO");
    SudoTicketApprovalRequestRule requestRule = (SudoTicketApprovalRequestRule) ruleDAO.find(EQ(foam.nanos.ruler.Rule.NAME, "SudoTicketApprovalRequestRule")).fclone();
    test(requestRule != null, "Request rule found");
    requestRule.setApprovers(new ArrayList(Arrays.asList(user1.getId())));
    requestRule = (SudoTicketApprovalRequestRule) ruleDAO.put(requestRule);
    test(requestRule.getApprovers().size() == 1, "RequestRule has 1 approver");
    test(requestRule.getApprovers().get(0) == user1.getId(), "RequestRule has approver user1");

    SudoTicketApprovalResponseRule responseRule = (SudoTicketApprovalResponseRule) ruleDAO.find(EQ(foam.nanos.ruler.Rule.NAME, "SudoTicketApprovalResponseRule")).fclone();
    test(responseRule != null, "Response rule found");
    responseRule.setAssignToGroup(group3.getId());
    responseRule = (SudoTicketApprovalResponseRule) ruleDAO.put(responseRule);
    test(responseRule.getAssignToGroup() == group3.getId(), "Response rule group 3");

   DAO ticketDAO = (DAO) x.get("localTicketDAO");
   SudoTicket ticket = new SudoTicket.Builder(x).setOwner(user2.getId()).setSudoAsUser(user3.getId()).setComment("user2 as user3").build();
   Subject subject = new Subject.Builder(x).setUser(user2).build();
   X y = x.put("subject", subject);
   ticket = (SudoTicket) ticketDAO.inX(y).put(ticket).fclone();

   ApprovalRequestClassificationEnum classification = ApprovalRequestClassificationEnum.SUDO_TICKET_APPROVAL;
   DAO approvalRequestDAO = ApprovalRequestUtil.getAllRequests(x, ticket.getId(), classification);
   ApprovalStatus status = ApprovalRequestUtil.getState(approvalRequestDAO);
   test(status != null, "ApprovalRequest found.");
   test(status == ApprovalStatus.REQUESTED, "ApprovalRequest REQUESTED");

   ApprovalRequest request = (ApprovalRequest) ((FObject)((ArraySink)ApprovalRequestUtil.getAllApprovalRequests(x, ticket.getId(), classification).limit(1).select(new ArraySink())).getArray().get(0)).fclone();
   request.setStatus(ApprovalStatus.APPROVED);
   request.setIsFulfilled(true);
   approvalRequestDAO.put(request);

   status = ApprovalRequestUtil.getState(approvalRequestDAO);
   test(status == ApprovalStatus.APPROVED, "ApprovalRequest APPROVED");
   // yield to allow aysnc ops to run.
   try {
     logger.debug("sleeping");
     Thread.currentThread().sleep(1000);
   } catch (InterruptedException e) {
     //nop
     Thread.currentThread().interrupt();
   }

   user2 = (User) userDAO.find(user2.getId());
   test( user2.getGroup().equals(group3.getId()), "User2 group changed to group3 ("+user2.getGroup()+")");

   ticket = (SudoTicket) ticketDAO.find_(y, ticket.getId()).fclone();
   ticket.setStatus("CLOSED");
   ticket = (SudoTicket) ticketDAO.put_(y, ticket);
   test( "CLOSED".equals(ticket.getStatus()), "Ticket closed");

   // yield to allow aysnc ops to run.
   try {
     logger.debug("sleeping");
     Thread.currentThread().sleep(1000);
   } catch (InterruptedException e) {
     //nop
     Thread.currentThread().interrupt();
   }

   user2 = (User) userDAO.find(user2.getId());
   test( user2.getGroup().equals(group2.getId()), "User2 group changed to group2 ("+user2.getGroup()+")");

   // TODO: 1) REQUESTED -> DECLINED, 2) APPROVED -> DECLINED
     `
    }
  ]
});
