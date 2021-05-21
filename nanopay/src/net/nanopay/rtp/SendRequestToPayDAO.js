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
  package: 'net.nanopay.rtp',
  name: 'SendRequestToPayDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.User',
    'foam.nanos.auth.token.Token',
    'foam.nanos.notification.email.EmailMessage',
    'foam.nanos.session.Session',
    'foam.util.Emails.EmailsUtility',
    'java.util.Calendar',
    'java.util.HashMap',
    'java.util.UUID',
    'foam.mlang.MLang',
    'net.nanopay.account.Account'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(
          `
            public SendRequestToPayDAO(X x, DAO delegate) {
              setX(x);
              setDelegate(delegate);
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
      RequestToPay rtp = (RequestToPay) obj;
      RequestToPay old = (RequestToPay) super.find(rtp.getId());
      
      // Skip processing if this is an update
      if ( old != null ) {
        return super.put_(x, obj);
      }

      // Set the payer session
      User payer = rtp.findPayer(x);
      if ( payer != null ) {
        DAO sessionDAO = (DAO) x.get("sessionDAO");
        Session payerSession = (Session) sessionDAO.find(MLang.EQ(Session.USER_ID, payer.getId()));
        if ( payerSession != null ) {
          rtp.setPayerSession(payerSession.getId());
        }
      }

      // Set the recipient name
      Account recipientAcc = rtp.findDestinationAccount(x);
      if ( recipientAcc != null ) {
        User recipient = recipientAcc.findOwner(x);
        if ( recipient != null ) {
          rtp.setRecipientName(recipient.getFirstName() + " " + recipient.getLastName());
        }
      }
      
      return super.put_(x, rtp);
      `
    }
  ]
});
