foam.CLASS({
  package: 'net.nanopay.tx.planner.fees',
  name: 'AbliiFeeRule',

  documentation: `
      Rule that adds fees for Ablii transactions
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'net.nanopay.tx.InvoicedFeeLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionLineItem'
  ],

  properties: [
    {
      class: 'Long',
      name: 'domesticFee',
      value: 75
    },
    {
      class: 'Long',
      name: 'internationalFee',
      value: 500
    }

  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Transaction tx = (Transaction) obj;
        Boolean sameCurrency = tx.findSourceAccount(x).getDenomination().equals(tx.findDestinationAccount(x).getDenomination());
        Long feeAmount = sameCurrency ? getDomesticFee() : getInternationalFee();
        tx.addLineItems(new TransactionLineItem[] {new InvoicedFeeLineItem.Builder(getX()).setGroup("InvoiceFee").setAmount(feeAmount).setCurrency(tx.getSourceCurrency()).build()});
      `
    }
  ]
});
