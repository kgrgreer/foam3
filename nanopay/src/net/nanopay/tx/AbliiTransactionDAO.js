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
    'net.nanopay.account.OverdraftAccount',
    'net.nanopay.account.LoanedTotalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Business',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',

    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',

    'java.util.ArrayList',
    'java.util.List',
    'foam.mlang.MLang'

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
          request.addNext(ct);


          TransactionQuote tq = (TransactionQuote) super.put_(x, quote);

          Transaction t = tq.getPlan();
          while ( ! (t instanceof CompositeTransaction) && t.getNext() != null && t.getNext().length > 0 ){
            t = t.getNext()[0];
          }
          if ( t != null && t instanceof CompositeTransaction ) {
            for ( Transaction ti : t.getNext() ) {
              if ( ti instanceof CITransaction ) {
                // add transfers for liability -> float
                Account a = ti.findDestinationAccount(x);

                  long floatAccount = ((LoanedTotalAccount) ((DAO) x.get("accountDAO")).find(
                    MLang.AND(
                      MLang.INSTANCE_OF( LoanedTotalAccount.class ),
                      MLang.EQ( LoanedTotalAccount.DENOMINATION,oda.getDenomination())
                    ))).getId();
                  List transfers = new ArrayList();
                  Transfer transfer = new Transfer.Builder(x)
                    .setAmount(-ti.getAmount())
                    .setAccount(liabilityAccount)
                    .setVisible(false)
                    .build();
                  transfers.add(transfer);
                  Transfer transfer2 = new Transfer.Builder(x)
                    .setAmount(ti.getAmount())
                    .setAccount(floatAccount)
                    .setVisible(false)
                    .build();
                  transfers.add(transfer2);
                  ti.add((Transfer[]) transfers.toArray(new Transfer[0]));
                }
              }
              if ( ti instanceof COTransaction ) {
                // add transfers for float -> liability
                 Account a = ti.getNext()[0].findSourceAccount(x);
                 // TODO: quote transaction between backing and 'this'.
                // planner  Digital -> Detable
                // if Digital Detable then quote again, repeat.

                if (a instanceof OverdraftAccount ) {
                  OverdraftAccount oda = (OverdraftAccount) a;
                  long liabilityAccount = oda.getBackingAccount();

                  Transaction d = new DebtTransaction.Builder(x)
                    .setSourceAccount(backingAccount)
                    .setDestinationAccount(detableAccount)
                    .build();
                  transfers.add(d);
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
                // if (a instanceof OverdraftAccount ) {
                //     OverdraftAccount oda = (OverdraftAccount) a;
                //     long liabilityAccount = oda.getBackingAccount();
                //     long floatAccount = ((LoanedTotalAccount) ((DAO) x.get("accountDAO")).find(
                //       MLang.AND(
                //         MLang.INSTANCE_OF( LoanedTotalAccount.class ),
                //         MLang.EQ( LoanedTotalAccount.DENOMINATION,oda.getDenomination())
                //       ))).getId();
                //     List transfers = new ArrayList();
                //     Transfer transfer = new Transfer.Builder(x)
                //       .setAmount(ti.getAmount())
                //       .setAccount(liabilityAccount)
                //       .setVisible(false)
                //       .build();
                //     transfers.add(transfer);
                //     Transfer transfer2 = new Transfer.Builder(x)
                //       .setAmount(-ti.getAmount())
                //       .setAccount(floatAccount)
                //       .setVisible(false)
                //       .build();
                //     transfers.add(transfer2);
                //     ti.add((Transfer[]) transfers.toArray(new Transfer[0]));

                // }
              }
            }
          }
          return tq;
        }
        catch ( RuntimeException e) {
          // transaction not eligible for fast pay
        }

        return super.put_(x, quote);
      `
    },
  ]
});
