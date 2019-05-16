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
      javaCode: `
        TransactionQuote quote = (TransactionQuote) obj;
        Transaction request = (Transaction) quote.getRequestTransaction().fclone();
        DAO localBusinessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);
        User destAccOwner;
        if ( ! ( request instanceof AbliiTransaction ) ) {
          return super.put_(x, obj);
        }

        Account destAcc = request.findDestinationAccount(getX());
        DAO localUserDAO = (DAO) x.get("localUserDAO");
        User owner = (User) localUserDAO.inX(x).find(destAcc.getOwner());

        if ( owner instanceof Contact ) {
          Contact contact = (Contact) owner;
          destAccOwner = (User) localBusinessDAO.find(contact.getBusinessId());
          if ( destAccOwner == null ) {
            destAccOwner = (User) owner;
          }
        } else {
          destAccOwner = (User) owner;
        }

        if ( destAcc instanceof DigitalAccount ) {
          BankAccount destBankAccount = BankAccount.findDefault(x, destAccOwner, request.getDestinationCurrency());

          if ( destBankAccount == null ) {
            throw new RuntimeException("Contact does not have a " + request.getDestinationCurrency() + " bank account.");
          }

          request.setDestinationAccount(destBankAccount.getId());
          quote.setRequestTransaction(request);
        }

        try {
          // check if we can make the CO at th same time as CI
          Account account = DigitalAccount.findDefault(x,(User) x.get("user"), request.getSourceCurrency());
          account.validateAmount(x, null, request.getAmount());
          CompositeTransaction ct = new CompositeTransaction();
          ct.copyFrom(request);
          ct.setIsQuoted(true);
          request.addNext(ct);



// NOTE: DebtTransaction takes care of generating Transfers.
// in TransactionDAO ignore transfers from DebtAccounts.
// The transfers below are not necesary.
// at time of Transfer if NSF then DECLINE Transaction, and
// append a new CO dependent on the CI.
// need IncurDebtTransaction and PayDebtTransaction, the CI
// would delegate to a PayDebtTransaction which can pay the correct account,
// else we call getTransfers from an Account.
// debtAccount.getTransfers(x, +/-amount); - incur, + pay.


        }
        catch ( RuntimeException e) {
          // transaction not eligible for fast pay
        }

        return super.put_(x, quote);
      `
    },
  ]
});
