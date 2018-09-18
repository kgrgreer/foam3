foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PayeeTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Determine destination account based on payee when account is not provided.
  `,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.HoldingAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.tx.model.Transaction'
  ],

  imports: [
    'localUserDAO'
  ],

  requires: [
    'foam.nanos.auth.User'
  ],

  implements: [
    'foam.mlang.Expressions'
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
        Transaction txn = (Transaction) obj;
        if ( txn.findDestinationAccount(x) == null ) {
          User user = (User) x.get("user");
          if ( user == null ) {
            throw new AuthenticationException();
          }
          User payee = (User) ((DAO) x.get("localUserDAO")).find_(x, txn.getPayeeId());
          if ( payee == null ) {
            Contact contact = (Contact) ((DAO) x.get("contactDAO")).find_(x, txn.getPayeeId());
            if ( contact == null ) {
              throw new RuntimeException("Payee not found");
            } else if ( SafetyUtil.equals(txn.getDestinationCurrency(), "CAD") ) {
              HoldingAccount holdingAcct = new HoldingAccount();
              holdingAcct.setInvoiceId(txn.getInvoiceId());
              holdingAcct.setDenomination("CAD");
              holdingAcct.setOwner(user.getId());
              HoldingAccount result = (HoldingAccount) ((DAO) x.get("localAccountDAO")).put_(x, holdingAcct);
              txn = (Transaction) obj.fclone();
              txn.setDestinationAccount(result.getId());
              return getDelegate().put_(x, txn);
            } else {
              // TODO: Send money an AFX holding account.
              throw new RuntimeException("Sending anything other than CAD to a contact is not supported yet.");
            }
          }
          DigitalAccount digitalAccount = DigitalAccount.findDefault(x, user, txn.getSourceCurrency());
          txn = (Transaction) obj.fclone();
          txn.setDestinationAccount(digitalAccount.getId());
        }
        return getDelegate().put_(x, txn);
      `
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PayeeTransactionDAO(foam.core.X x, foam.dao.DAO delegate) {
            System.err.println("Direct constructor use is deprecated. Use Builder instead.");
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});
