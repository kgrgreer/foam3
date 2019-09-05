foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'TransactionLimitRuleAction',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `This action implementation is responsible for for updating running limits
  and reverting it back in case transaction did not go through.

  `,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.ruler.TestedRule',
    'java.util.HashMap',
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      class: 'Double',
      name: 'limit'
    },
    {
      class: 'Boolean',
      name: 'send',
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.util.Frequency',
      name: 'period',
      value: 'DAILY',
    },
    {
      class: 'Map',
      name: 'currentLimits',
      visibility: 'RO',
      javaFactory: `
        return new java.util.HashMap<Object, TransactionLimitState>();
      `
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      if ( agency instanceof TestedRule) {
        ((TestedRule)agency).setName("transactionLimits");
      }
      Transaction txn = (Transaction) obj;

      DAO transactionDAO = (DAO) x.get("localTransactionDAO");
      Transaction oldTxn = (Transaction) transactionDAO.find_(x, obj);

      Object id = this.getSend() ? txn.getSourceAccount() : txn.getDestinationAccount();

      TransactionLimitState limitState = getLimitState(id);
      if ( agency instanceof TestedRule ) {
        TransactionLimitProbeInfo info = new TransactionLimitProbeInfo();
        info.setRemainingLimit(this.getLimit() - limitState.getSpent());
        info.setMessage("Your remaining limit is " + (this.getLimit() - limitState.getSpent()) );
        ((TestedRule)agency).setProbeInfo(info);
      }
      if ( ! limitState.check(this.getLimit(), this.getPeriod(), txn.getAmount()) ) {
        String s = "";
        if ( this.getPeriod() == net.nanopay.util.Frequency.DAILY ) {
          s = "Your current available limit is " + ((double) (Math.round(this.getLimit() - limitState.getSpent())/100.0)) + ". ";
        }
        throw new RuntimeException("This transaction exceeds your " + this.getPeriod() + " transaction limit. " 
          + s + "If you require further assistance, please contact us. ");
      }
      agency.submit(x, x1 -> limitState.updateSpent(Double.valueOf(txn.getAmount())), "Your transaciton will be proccessed.");
      `
    },
    {
      name: 'getLimitState',
      type: 'TransactionLimitState',
      args: [
        {
          name: 'id', type: 'Object'
        }
      ],
      javaCode: `
        TransactionLimitState state = (TransactionLimitState) this.getCurrentLimits().get(id);
        if ( state == null ) {
          state = new TransactionLimitState();
          this.getCurrentLimits().put(id, state);
        }
        return state;
      `
    }
  ]
});

