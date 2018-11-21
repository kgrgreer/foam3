foam.INTERFACE({
  package: 'net.nanopay.kotak',
  name: 'Kotak',

  documentation: 'Interface for Kotak API',

  methods: [
    {
      name: 'initiatePayment',
      returns: 'Promise',
      javaReturns: 'net.nanopay.kotak.model.paymentResponse.AcknowledgementType',
      // args: [
      //   {
      //     class: 'FObjectProperty',
      //     of: 'net.nanopay.kotak.model.paymentResponse.InitiateRequest',
      //     name: 'request'
      //   }
      // ]
    },
    {
      name: 'initiateReversal',
      returns: 'Promise',
      javaReturns: 'net.nanopay.kotak.model.reversal.Reversal',
      args: [
        {
          class: 'FObjectProperty',
          of: 'net.nanopay.kotak.model.reversal.Reversal',
          name: 'request'
        }
      ]
    }
  ]
});
