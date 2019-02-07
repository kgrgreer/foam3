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
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject'
        }
      ],
      javaReturns: 'foam.core.FObject',
      javaCode: `
        TransactionQuote quote = (TransactionQuote) obj;
        Transaction request = (Transaction) quote.getRequestTransaction().fclone();
        DAO businessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);
        User destAccOwner;
        if ( ! ( request instanceof AbliiTransaction ) ) {
          return super.put_(x, obj);
        }

        Account destAcc = request.findDestinationAccount(x);
        User owner = (User) destAcc.findOwner(x);

        if ( owner instanceof Contact ) {
          Contact contact = (Contact) owner;
          destAccOwner = (User) businessDAO.find(contact.getBusinessId());
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

        return super.put_(x, quote);
      `
    },
  ]
});
