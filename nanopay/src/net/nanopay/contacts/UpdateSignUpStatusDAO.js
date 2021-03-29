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
  package: 'net.nanopay.contacts',
  name: 'UpdateSignUpStatusDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    The purpose of this DAO decorator is to set the signUpStatus property on a
    contact to ACTIVE if the business it refers to has joined the platform.
  `,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.account.Account'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public UpdateSignUpStatusDAO(X x, DAO delegate) {
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
        if ( ! (obj instanceof Contact) ) {
          return super.put_(x, obj);
        }

        Contact contact = (Contact) obj;

        if ( ContactStatus.CONNECTED.equals(contact.getSignUpStatus()) ) {
          return super.put_(x, contact);
        }

        DAO accountDAO = (DAO)x.get("accountDAO");
        Account account = (Account) accountDAO.find(contact.getBankAccount()); 

        if (account == null) {
          contact.setSignUpStatus(ContactStatus.PENDING);
        } else {
          contact.setSignUpStatus(ContactStatus.READY);
        }

        return super.put_(x, contact);
      `
    }
  ]
});

