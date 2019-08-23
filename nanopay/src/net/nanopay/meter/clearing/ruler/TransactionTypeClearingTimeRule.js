foam.CLASS({
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'TransactionTypeClearingTimeRule',
  extends: 'net.nanopay.meter.clearing.ruler.ClearingTimeRule',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    {
      name: 'action',
      javaGetter: `
        return (x, obj, oldObj, ruler, agency) -> {
          if ( getOf() != null && getOf().getObjClass().isInstance(obj) ) {
            incrClearingTime((Transaction) obj);
          }
        };
      `
    }
  ]
});
