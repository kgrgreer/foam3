foam.CLASS({
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'BusinessClearingTimeRule',
  extends: 'net.nanopay.meter.clearing.ruler.ClearingTimeRule',

  javaImports: [
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.model.Business',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Long',
      name: 'business'
    },
    {
      name: 'duration',
      validationPredicates: [
        {
          args: ['duration'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.meter.clearing.ruler.ClearingTimeRule.DURATION, 0);
          }
        }
      ]
    },
    {
      name: 'action',
      javaFactory: `
        return (x, obj, oldObj, ruler, agency) -> {
          Transaction transaction = (Transaction) obj;
          Account account = findAccount(x, transaction);
          User owner = account.findOwner(x);

          if ( owner instanceof Business
            && getBusiness() == owner.getId()
          ) {
            incrClearingTime(transaction);
          }
        };
      `
    }
  ]
});
