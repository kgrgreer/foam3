foam.INTERFACE({
  package: 'net.nanopay.cron',
  name: 'RecurringInvoiceInterface',
  extends: 'foam.nanos.NanoService',

  methods: [
    // {
    //   name: 'getRate',
    //   javaReturns: 'net.nanopay.fx.model.ExchangeRateQuote',
    //   returns: 'Promise',
    //   javaThrows: [ 'java.lang.RuntimeException' ],
    //   args: [
    //     {
    //       name: 'from',
    //       javaType: 'String'
    //     },
    //     {
    //       name: 'to',
    //       javaType: 'String'
    //     },
    //     {
    //       name: 'amountI',
    //       javaType: 'long'
    //     }
    //   ]
    // }, 
    {
      name: 'runCron',
      javaReturns: 'void',
      javaThrows: [ 'java.lang.RuntimeException' ],
      args: []
    }
  ]
});