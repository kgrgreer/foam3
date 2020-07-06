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
  package: 'net.nanopay.bank',
  name: 'GetDefaultCurrencyDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    A standalone DAO that acts like a service. Put an object to it with a contact
    object and it will return the default currency of that contact.
  `,

  javaImports: [
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.LifecycleState',
    'net.nanopay.account.Account',
    'net.nanopay.contacts.Contact'
  ],

  messages: [
    { name: 'NULL_REQUEST_ERROR_MSG', message: 'Cannot pull null' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'accountDAO'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'contactDAO'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public GetDefaultCurrencyDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
            setAccountDAO(((DAO) x.get("localAccountDAO")).inX(x));
            setContactDAO(((DAO) x.get("contactDAO")).inX(x));
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
        if ( obj == null ) throw new RuntimeException(NULL_REQUEST_ERROR_MSG);

        GetDefaultCurrency request = (GetDefaultCurrency) obj;
        Contact            contact = (Contact) getContactDAO().inX(x).find(request.getContactId());
        GetDefaultCurrency response = (GetDefaultCurrency) request.fclone();
        Long id = (contact.getBusinessId() != 0) ? contact.getBusinessId() : contact.getId();

        BankAccount bankAccount = (BankAccount) getAccountDAO()
          .find(
            AND(
              EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
              EQ(Account.DELETED, false),
              EQ(BankAccount.OWNER, id),
              INSTANCE_OF(BankAccount.class),
              EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED)
            )
          );
        if ( bankAccount != null ) response.setResponse(bankAccount.getDenomination());
        return response;
      `
    },
    {
      name: 'find_',
      javaCode: `
        return null;
      `
    },
    {
      name: 'select_',
      javaCode: `
        return new ArraySink();
      `
    },
    {
      name: 'remove_',
      javaCode: `
        return null;
      `
    }
  ]
});

