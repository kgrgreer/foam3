foam.INTERFACE({
  package: 'net.nanopay.fx.kotak',
  name: 'Kotak',

  documentation: 'Interface for Kotak API',

  methods: [
    {
      name: 'initiatePayment',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.kotak.model.AcknowledgementType',
      args: [
        {
          class: 'FObjectProperty',
          of: 'net.nanopay.fx.kotak.model.InitiateRequest',
          name: 'request'
        }
      ]
    },
    {
      name: 'initiateReversal',
      returns: 'Promise',
      javaReturns: 'net.nanopay.fx.kotak.model.Reversal',
      args: [
        {
          class: 'FObjectProperty',
          of: 'net.nanopay.fx.kotak.model.Reversal',
          name: 'request'
        }
      ]
    }
  ]
});
