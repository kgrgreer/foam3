foam.INTERFACE({
  package: 'net.nanopay.fx.kotak',
  name: 'Kotak',
  documentation: 'Interface for Kotak API',
  methods: [
    {
      name: 'initiatePayment',
      async: true,
      returns: 'net.nanopay.fx.kotak.model.AcknowledgementType',
      args: [
        {
          type: 'net.nanopay.fx.kotak.model.InitiateRequest',
          name: 'request'
        }
      ]
    },
    {
      name: 'initiateReversal',
      async: true,
      returns: 'net.nanopay.fx.kotak.model.Reversal',
      args: [
        {
          type: 'net.nanopay.fx.kotak.model.Reversal',
          name: 'request'
        }
      ]
    }
  ]
});
