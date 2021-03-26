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

      // Retrieve the currencies
      DAO currencyDAO = ((DAO) x.get("currencyDAO")).inX(x);
      Currency transactionCurrency = (Currency) currencyDAO.find(transaction.getSourceCurrency());
      Currency ruleCurrency = (Currency) currencyDAO.find(txLimitRule.getDenomination());

      // Amount of the transaction in the transaction source currency
      long amount = -transaction.getTotal(x, transaction.getSourceAccount());
      if ( !txLimitRule.getSend() && 
         ( transaction.getTotal(x, transaction.getDestinationAccount()) > 0) && 
         ( transaction.getDestinationCurrency() != null ) )
      {
        amount = transaction.getTotal(x, transaction.getDestinationAccount());  
        transactionCurrency = (Currency) currencyDAO.find(transaction.getDestinationCurrency());
      }

      // Convert to rule currency if necessary
      if ( ! SafetyUtil.equals(transactionCurrency.getId(), ruleCurrency.getId()) ) {
        try {
          ExchangeRateService ers = (ExchangeRateService) x.get("exchangeRateService");
          amount = ers.exchange(transactionCurrency.getId(), ruleCurrency.getId(), amount);
        } catch (Exception e) {
          Logger logger = (Logger) x.get("logger");
          logger.warning("FX conversion missing. Cannot apply rule " + txLimitRule.getId(), e);

          // Do not continue to apply rule since the amount cannot be added to the limitState
          return;
        }
      }

      // Add information if this is a probe
      if ( testedRule != null ) {
        String availableLimit = (ruleCurrency != null) ?
          ruleCurrency.format(txLimitRule.getLimit() - limitState.getSpent()) :
          String.format("%s", txLimitRule.getLimit() - limitState.getSpent());
        testedRule.setProbeInfo(
          new TransactionLimitProbeInfo.Builder(x)
            .setRemainingLimit(txLimitRule.getLimit() - limitState.getSpent())
            .setMessage("The " + 
                txLimitRule.getApplyLimitTo().getLabel().toLowerCase() + " " +
                txLimitRule.getPeriod().getLabel().toLowerCase() + " " + 
                (txLimitRule.getSend() ? "sending" : "receiving") + 
                " limit exceeded. AvailableLimit: " + availableLimit)
            .build());
      }

      // Check the limit
      if ( ! limitState.check(txLimitRule.getLimit(), txLimitRule.getPeriod(), amount) ) {
        throw new RuntimeException("The " + 
          txLimitRule.getApplyLimitTo().getLabel().toLowerCase() + " " +
          txLimitRule.getPeriod().getLabel().toLowerCase() + " " + 
          (txLimitRule.getSend() ? "sending" : "receiving") + 
          " limit was exceeded.");
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
          .append(rule.getApplyLimitTo() == TxLimitEntityType.BUSINESS ? rule.getBusinessToLimit() :
                  rule.getApplyLimitTo() == TxLimitEntityType.USER ? rule.getUserToLimit() :
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

