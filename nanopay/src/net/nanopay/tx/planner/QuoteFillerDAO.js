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
  package: 'net.nanopay.tx.planner',
  name: 'QuoteFillerDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Groom the quote, so it has useful information to help with planning.
  `,

  javaImports: [
    'foam.core.ValidationException',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.liquidity.LiquiditySettings',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.account.SecuritiesAccount',
    'foam.util.SafetyUtil',
    'foam.nanos.auth.LifecycleState',
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `

        Logger logger = (Logger) x.get("logger");
        TransactionQuote quote = (TransactionQuote) obj;
        Transaction txn = quote.getRequestTransaction();
        User payer = null;

        if ( txn.getPayerId() != 0 ) {
          payer = (User) ((DAO) x.get("bareUserDAO")).find_(x, txn.getPayerId());
        }
        else {
          if (txn.getSourceAccount() != null) {
            Account source = (Account) ((DAO) x.get("accountDAO")).find_(x, txn.getSourceAccount());
            payer = (User) source.findOwner(x);
          }
        }
        if (payer == null ) {
          ((Logger) x.get("logger")).error("Payer not found", txn.getId(), "source", txn.getSourceAccount(), "payer", txn.getPayerId());
          throw new ValidationException("Payer not found");
        }

        // ---- set source account
        Account account = txn.findSourceAccount(x);
        if ( account == null ) {
          account = DigitalAccount.findDefault(x, payer, txn.getSourceCurrency());
          txn.setSourceAccount(account.getId());
        }
        quote.setSourceAccount(account);

        // ---- set destination account
        Account destAccount = txn.findDestinationAccount(x);
        if ( destAccount == null ) {
          User payee = (User) ((DAO) x.get("bareUserDAO")).find_(x, txn.getPayeeId());
          if ( payee == null ) {
            ((Logger) x.get("logger")).error("Payee not found", txn.getId(), "source", txn.getDestinationAccount(), "payee", txn.getPayeeId());
            throw new ValidationException("Payee not found");
          }
          DigitalAccount accountDigital = DigitalAccount.findDefault(x, payee, txn.getDestinationCurrency());
          
          // Once Ablii has digital account support, will need to make AFEX support CAD digital accounts as well.
          // AFEX planner will know which trust account to use for AFEXTransaction and then add on
          // a digitalTransaction to move funds to the destination digitalAccount
          // afexTransactionPlanner:
          //   - AFEXTransaction for : US-USD -> CA-CAD
          //   - DigitalTransaction for : CA-CAD -> CA-Digital
          LiquiditySettings digitalAccLiquidity = accountDigital.findLiquiditySetting(x);
          if ( digitalAccLiquidity == null || (! digitalAccLiquidity.getHighLiquidity().getEnabled()) ) {
            Account bankAccount = BankAccount.findDefault(x, payee, txn.getDestinationCurrency());
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

        quote.setAmount(txn.getAmount());
        quote.setDestinationAmount(txn.getDestinationAmount());

        quote.setSourceUnit(txn.getSourceCurrency());
        quote.setDestinationUnit(txn.getDestinationCurrency());
        if ( quote.getParent() != null && quote.getParent().getRequestOwner() != 0 ){
          quote.setRequestOwner(quote.getParent().getRequestOwner());
        } else {
          quote.setRequestOwner(account.getOwner());
        }
        txn.validate(x); // validate the request txn 1st
        txn.freeze();
        if ( quote.getSourceAccount() instanceof SecuritiesAccount &&
        quote.getDestinationAccount() instanceof SecuritiesAccount ) {
         throw new ValidationException(" Securities quotes are not currently accepted here"); //TODO: for now just block securities. will need to make sure they dont hit the regular transaction planners. maybe by redirection to a rule engine that only has securities rules.
        }
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
