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
  package: 'net.nanopay.partners',
  name: 'MakeConnectionDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'net.nanopay.model.Invitation',
    'net.nanopay.model.InvitationStatus'
  ],

  messages: [
    { name: 'REQUEST_ACCEPT_MSG', message: ' accepted your request to connect.' },
    { name: 'PARTNER_INVIT_RESULT_MSG', message: 'Partner invitation result' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public MakeConnectionDAO(X x, DAO delegate) {
            super(x, delegate);
          }    
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Invitation invite = (Invitation) obj.fclone();

        // Check if status is set appropriately
        boolean accepted = invite.getStatus() == InvitationStatus.ACCEPTED;
        boolean ignored = invite.getStatus() == InvitationStatus.IGNORED;
        if ( ! (accepted || ignored) ) {
          return super.put_(x, obj);
        }

        // Set status
        invite.setStatus(InvitationStatus.COMPLETED);

        // Add as partners
        User user = ((Subject) x.get("subject")).getUser();
        DAO userDAO = (DAO) x.get("localUserDAO");
        User sender = (User) userDAO.find_(x, invite.getCreatedBy());
        user.getPartners(x).add(sender);

        // Send notification if accepted
        if ( accepted ) {
          Notification notification = new Notification();
          notification.setBody(user.getLegalName() + REQUEST_ACCEPT_MSG);
          notification.setNotificationType(PARTNER_INVIT_RESULT_MSG);
          sender.doNotify(x, notification);
        }

        return super.put_(x, invite);
      `
    }
  ]
});
