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
  name: 'CanReceiveCurrencyDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    A standalone DAO that acts like a service. Put an object to it with a user id
    and a currency and it tells you whether that user has a verified bank account
    in that currency.  
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.contacts.Contact',
    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'NULL_REQUEST_ERROR_MSG', message: 'Cannot put null' },
    { name: 'NO_BANK_INFO_ERROR_MSG', message: 'Banking information for this contact must be provided' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'bareUserDAO'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'accountDAO'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public CanReceiveCurrencyDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
            setBareUserDAO(((DAO) x.get("bareUserDAO")).inX(x));
            setAccountDAO(((DAO) x.get("accountDAO")).inX(x));
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

        CanReceiveCurrency request = (CanReceiveCurrency) obj;

        // Reusing this service for a liquid requirement:
        // Given an account id return if this is an account-not aggregate - and its currency.
        // will return account selection validity with response.response
        // and denomination in response.message
        if ( request.getAccountChoice() > 0 ) return accountSelectionLookUp(x, request);

        CanReceiveCurrency response = (CanReceiveCurrency) request.fclone();

        User user = (User) getBareUserDAO().inX(x).find(request.getUserId());
        // Get business if user is contact.
        user = checkUser(x, user, request.getUserId(), request);
        // Checks if the contact has a bank account
        // Needed for a better error message to improve user experience
        Count hasBankAccount = (Count) getAccountDAO()
          .where(AND(
            INSTANCE_OF(BankAccount.getOwnClassInfo()),
            EQ(BankAccount.DELETED, false),
            EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED),
            EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
            EQ(Account.OWNER, user.getId())))
          .select(new Count());

        if ( hasBankAccount.getValue() == 0 ) {
          response.setMessage(NO_BANK_INFO_ERROR_MSG);
          response.setResponse(false);
          return response;
        }

        // Checks if the contact can receive the currency
        Count count = (Count) getAccountDAO()
          .where(AND(
            INSTANCE_OF(BankAccount.getOwnClassInfo()),
            EQ(BankAccount.DELETED, false),
            EQ(BankAccount.DENOMINATION, request.getCurrencyId()),
            EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED),
            EQ(Account.OWNER, user.getId())))
          .select(new Count());
        boolean contactRecieveCurrency = (count.getValue() > 0);
      
        response.setResponse(contactRecieveCurrency);
        if ( count.getValue() == 0 ) response.setMessage("This contact is not able to accept " + request.getCurrencyId() + " payments at this time.");
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
    },
    {
      name: 'checkUser',
      type: 'User',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'User', name: 'user' },
        { type: 'long', name: 'id' },
        { type: 'CanReceiveCurrency', name: 'request' }
      ],
      javaCode: `
        if ( user == null ) {
          throw new RuntimeException("Warning: User " + id + " was not found.");
        }
        if ( user instanceof Contact ) {
          if ( ((Contact) user).getBusinessId() > 0 ) {
            User realUser = (User) getBareUserDAO().find(((Contact) user).getBusinessId());
            if ( realUser != null ) {
              return realUser;
            }
          } else {
            if (request.getUserId() != request.getPayerId()) {
              ((Logger) x.get("logger")).error("Warning: User " + id + " is a contact with no Business Id.");
              return user;
            }
          }
        }
        return user;
      `
    },
    {
      name: 'accountSelectionLookUp',
      type: 'CanReceiveCurrency',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'CanReceiveCurrency', name: 'query' }
      ],
      javaCode: `
        CanReceiveCurrency response = (CanReceiveCurrency) query.fclone();
        response.setResponse(false);
        ArraySink accountSink = (ArraySink) getAccountDAO().where(AND(
          EQ(net.nanopay.account.Account.DELETED, false),
          EQ(net.nanopay.account.Account.LIFECYCLE_STATE, foam.nanos.auth.LifecycleState.ACTIVE),
          EQ(net.nanopay.account.Account.ID, query.getAccountChoice()),
          OR(
            CLASS_OF(net.nanopay.account.DigitalAccount.class),
            INSTANCE_OF(net.nanopay.account.ShadowAccount.class)
          )
        )).select(new ArraySink());

        if ( accountSink.getArray().size() > 0 ) {
          Account account = (Account)accountSink.getArray().get(0);
          response.setResponse(true);
          response.setMessage(account.getDenomination());
        }
        return response;
      `
    }
  ]
});
