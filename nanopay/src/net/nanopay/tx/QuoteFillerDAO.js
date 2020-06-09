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
  name: 'QuoteFillerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Groom the quote, so it has useful information to help with planning.
  `,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.liquidity.LiquiditySettings',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction',
    'foam.util.SafetyUtil',
    'foam.nanos.auth.LifecycleState'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( ! ( obj instanceof TransactionQuote ) ) {
          return getDelegate().put_(x, obj);
        }

        Logger logger = (Logger) x.get("logger");
        TransactionQuote quote = (TransactionQuote) obj;
        Transaction txn = quote.getRequestTransaction();

        // ---- clear the incoming quote
        txn.setNext(null);
        quote.setPlans(new Transaction[] {});
        quote.setPlan(null);

        // ---- set source account
        Account account = txn.findSourceAccount(x);
        if ( account == null ) {
          User user = (User) ((DAO) x.get("bareUserDAO")).find_(x, txn.getPayerId());
          if ( user == null ) {
            ((Logger) x.get("logger")).error("Payer not found", txn.getId(), "source", txn.getSourceAccount(), "payer", txn.getPayerId());
            throw new RuntimeException("Payer not found");
          }
          account = DigitalAccount.findDefault(getX(), user, txn.getSourceCurrency());
          txn.setSourceAccount(account.getId());
          quote.setSourceAccount(account);
        } else {
          quote.setSourceAccount(account);
        }

        // ---- set destination account
        Account destAccount = txn.findDestinationAccount(x);
        if ( destAccount == null ) {
          User user = (User) ((DAO) x.get("bareUserDAO")).find_(x, txn.getPayeeId());
          if ( user == null ) {
            ((Logger) x.get("logger")).error("Paye not found", txn.getId(), "source", txn.getDestinationAccount(), "payer", txn.getPayeeId());
            throw new RuntimeException("Payee not found");
          }
          DigitalAccount accountDigital = DigitalAccount.findDefault(getX(), user, txn.getDestinationCurrency());
          
          // Once Ablii has digital account support, will need to make AFEX support CAD digital accounts as well.
          // AFEX planner will know which trust account to use for AFEXTransaction and then add on
          // a digitalTransaction to move funds to the destination digitalAccount
          // afexTransactionPlanner:
          //   - AFEXTransaction for : US-USD -> CA-CAD
          //   - DigitalTransaction for : CA-CAD -> CA-Digital
          LiquiditySettings digitalAccLiquidity = accountDigital.findLiquiditySetting(x);
          if ( digitalAccLiquidity == null || (! digitalAccLiquidity.getHighLiquidity().getEnabled()) ) {
            Account bankAccount = BankAccount.findDefault(x, user, txn.getDestinationCurrency());
            if ( bankAccount != null ) {
              destAccount = bankAccount;
            }
          } 
          if ( destAccount == null ) {
            destAccount = accountDigital;
          }
          txn.setDestinationAccount(destAccount.getId());
          quote.setDestinationAccount(destAccount);
        } else {
          quote.setDestinationAccount(destAccount);
        }

         // ---- Fill in empty currencies
        if ( SafetyUtil.isEmpty(txn.getSourceCurrency()) ) {
          logger.log("Transaction Source Currency not specified, defaulting to source account denomination");
          txn.setSourceCurrency(quote.getSourceAccount().getDenomination());
        }

        if ( SafetyUtil.isEmpty(txn.getDestinationCurrency()) ) {
          logger.log("Transaction Source Currency not specified, defaulting to source account denomination");
          txn.setDestinationCurrency(quote.getDestinationAccount().getDenomination());
        }

        quote.setSourceUnit(txn.getSourceCurrency());
        quote.setDestinationUnit(txn.getDestinationCurrency());
        txn.freeze();
        return getDelegate().put_(x, quote);
      `
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public QuoteFillerDAO(foam.core.X x, foam.dao.DAO delegate) {
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});
