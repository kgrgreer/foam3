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
  package: 'net.nanopay.tx',
  name: 'AbliiTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',

    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.Debtable'
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'foam.core.FObject',
      javaCode: `TransactionQuote quote = (TransactionQuote) obj;
      Transaction request = quote.getRequestTransaction();
      if ( ! ( request instanceof AbliiTransaction ) ) {
        return super.put_(x, obj);
      }
      DAO localBusinessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);
      User destAccOwner;
      Account destAcc = quote.getDestinationAccount();
      Account sourceAcc = quote.getSourceAccount();
      DAO localUserDAO = (DAO) x.get("localUserDAO");
      User sender = (User) localUserDAO.inX(x).find(sourceAcc.getOwner());
      User receiver = (User) localUserDAO.inX(x).find(destAcc.getOwner());

      if ( receiver instanceof Contact ) {
        Contact contact = (Contact) receiver;
        destAccOwner = (User) localBusinessDAO.find(contact.getBusinessId());
        if ( destAccOwner == null ) {
          destAccOwner = receiver;
        }
      } else {
        destAccOwner = receiver;
      }

      if ( destAcc instanceof DigitalAccount ) {
        BankAccount destBankAccount = BankAccount.findDefault(getX(), destAccOwner, request.getDestinationCurrency());

        if ( destBankAccount == null ) {
          ((Logger) x.get("logger")).error("Contact does not have a " + request.getDestinationAccount() + " bank account for request " + request );
          throw new RuntimeException("Contact does not have a " + request.getDestinationCurrency() + " bank account.");
        }
        request.setDestinationAccount(destBankAccount.getId());
        quote.setDestinationAccount(destBankAccount);
      }

      // Check if we can do FastPay from sender's business
      Account senderDigitalAccount = DigitalAccount.findDefault(getX(), sender, request.getSourceCurrency());
      if (senderDigitalAccount instanceof Debtable &&
        ((Debtable) senderDigitalAccount).findDebtAccount(x) != null && // should be system context?
        ((Debtable) senderDigitalAccount).findDebtAccount(x).getLimit() >= ( request.getAmount() - (long) senderDigitalAccount.findBalance(x) ) &&
        SafetyUtil.equals(request.getSourceCurrency(), request.getDestinationCurrency()) &&
        request.getSourceCurrency().equals("CAD") &&
        ( ((Debtable) senderDigitalAccount).findDebtAccount(x).findCreditorAccount(x) ) != null ) {
          CompositeTransaction ct = new CompositeTransaction();
          ct.copyFrom(request);
          ct.setName("Composite Transaction for FastPay");
          request.addNext(ct);
      }
      return super.put_(x, quote);`
    },
  ]
});
