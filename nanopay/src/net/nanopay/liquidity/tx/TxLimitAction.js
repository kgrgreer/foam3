foam.CLASS({
  package: 'net.nanopay.liquidity.tx',
  name: 'TxLimitAction',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `This rule action checks and updates current transaction limits,
  and reverting it back in case transaction did not go through.`,

  javaImports: [
    'foam.core.Currency',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.ruler.TestedRule',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.ruler.TransactionLimitProbeInfo',
    'net.nanopay.tx.ruler.TransactionLimitState',
    'net.nanopay.util.Frequency',
    'net.nanopay.fx.ExchangeRateService',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      // This action only works with TxLimitRules
      TxLimitRule txLimitRule = (TxLimitRule) rule;

      // Set the name of the agency if this is a probe
      TestedRule testedRule = null;
      if ( agency instanceof TestedRule) {
        testedRule = (TestedRule) agency;
        testedRule.setName("txlimits");
      }

      // Construct the key for the given transaction and rule 
      Transaction transaction = (Transaction) obj;
      String key = this.getKey(txLimitRule, transaction);

      // Find the transation limit for the given key
      TransactionLimitState limitState = (TransactionLimitState) txLimitRule.getCurrentLimits().get(key);
      if ( limitState == null ) {
        limitState = new TransactionLimitState();
        txLimitRule.getCurrentLimits().put(key, limitState);
      }

      // Amount of the transaction in the transaction source currency
      long amount = transaction.getAmount();
      long ruleCurrAmount = amount;
      // Retrieve the currencies
      DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
      Currency transactionCurrency = (Currency) currencyDAO.find(transaction.getSourceCurrency());
      Currency ruleCurrency = (Currency) currencyDAO.find(txLimitRule.getDenomination());

      // Convert to rule currency if necessary
      if ( ! SafetyUtil.equals(transactionCurrency.getId(), ruleCurrency.getId()) ) {
        User user = (User) x.get("user");
        ExchangeRateService ers = (ExchangeRateService) x.get("exchangeRateService");
        
        ruleCurrAmount = ers.exchange(transactionCurrency.getId(), ruleCurrency.getId(), amount);
      }
      
      // Compute the amounts
      String availableLimit = (ruleCurrency != null) ?
        ruleCurrency.format(txLimitRule.getLimit() - limitState.getSpent()) :
        String.format("%s", txLimitRule.getLimit() - limitState.getSpent());
      String txAmount = (transactionCurrency != null) ?
        transactionCurrency.format(amount) :
        String.format("%s", amount);
      Account account = txLimitRule.getSend() ? transaction.findSourceAccount(x) : transaction.findDestinationAccount(x);
      User user = account.findOwner(x);

      // Add information if this is a probe
      if ( testedRule != null ) {
        testedRule.setProbeInfo(
          new TransactionLimitProbeInfo.Builder(x)
            .setRemainingLimit(txLimitRule.getLimit() - limitState.getSpent())
            .setMessage(
              "Remaining limit for " + txLimitRule.getApplyLimitTo().getLabel() + " " +
              (txLimitRule.getApplyLimitTo() == TxLimitEntityType.USER ||
               txLimitRule.getApplyLimitTo() == TxLimitEntityType.ACCOUNT ? account.getName() : "") 
              + " is " + availableLimit )
            .build());
      }

      // Check the limit
      if ( ! limitState.check(txLimitRule.getLimit(), txLimitRule.getPeriod(), ruleCurrAmount) ) {
        long exceeded = amount - (txLimitRule.getLimit() - limitState.getSpent());
        throw new RuntimeException("The " + txLimitRule.getPeriod().getLabel().toLowerCase()
          + " limit was exceeded by " 
          + ( transactionCurrency != null ? transactionCurrency.format(exceeded) : String.format("%s", exceeded) )
          + " transaction " 
          + (txLimitRule.getSend() ? "from " : "to ")
          + txLimitRule.getApplyLimitTo().getLabel().toLowerCase() 
          + (txLimitRule.getApplyLimitTo() == TxLimitEntityType.USER ? " " + user.label() :
             txLimitRule.getApplyLimitTo() == TxLimitEntityType.ACCOUNT ? ! SafetyUtil.isEmpty(account.getName()) ? " " + account.getName() : " " + account.getId() : "")
          + ". Current available limit is " + availableLimit 
          + ". If you require further assistance, please contact your administrator.");
      }

      // Note: there is a race condition here between the check call above and the updateSpent call below
      //       users could submit two transactions in close enough proximity and could get through these limits
      //       if they both checked before one of them updated the txLimitState

      // Update the amount spent in the limit state
      final long spentAmount = amount;
      final Frequency period = txLimitRule.getPeriod();
      final TransactionLimitState txLimitState = limitState;
      agency.submit(x, x1 -> txLimitState.updateSpent(Long.valueOf(spentAmount), period), "Transaciton limits proccessing amount spent.");
      `
    },
    {
      name: 'getKey',
      type: 'String',
      args: [
        {
          name: 'rule',
          type: 'TxLimitRule'
        },
        {
          name: 'transaction',
          type: 'Transaction'
        }
      ],
      javaCode: `
        // Build the transaction limit state key from the rule configuration
        StringBuilder sb = new StringBuilder();
        sb.append("txlimit:")
          .append(rule.getApplyLimitTo())
          .append(":")
          .append(rule.getApplyLimitTo() == TxLimitEntityType.USER ? rule.getUserToLimit() :
                  rule.getApplyLimitTo() == TxLimitEntityType.ACCOUNT ? rule.getAccountToLimit() : 0)
          .append(":")
          .append(rule.getDenomination())
          .append(":")
          .append(rule.getPeriod());
        return sb.toString();
      `
    }
  ]
});

