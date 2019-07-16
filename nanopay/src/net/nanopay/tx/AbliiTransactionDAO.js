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
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Business',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',

    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.account.Debtable',
    'net.nanopay.account.DebtAccount',


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
        ((Debtable) senderDigitalAccount).findDebtAccount(x).getLimit() > 0 &&
        SafetyUtil.equals(request.getSourceCurrency(), request.getDestinationCurrency()) &&
        request.getSourceCurrency().equals("CAD") ) {
          CompositeTransaction ct = new CompositeTransaction();
          ct.copyFrom(request);
          ct.setIsQuoted(true);
          ct.setName("Composite Transaction for FastPay");
          request.addNext(ct);
      }
      return super.put_(x, quote);`
    },
  ]
});
