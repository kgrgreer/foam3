foam.INTERFACE({
  package: 'net.nanopay.kotak',
  name: 'Kotak',

  documentation: 'Interface for Kotak API',

  methods: [
    {
      name: 'submitPayment',
      async: true,
      type: 'net.nanopay.kotak.model.paymentResponse.AcknowledgementType',
      args: [
        {
          type: 'FObject',
          name: 'request'
        }
      ]
    },
    {
      name: 'submitReversal',
      async: true,
      type: 'net.nanopay.kotak.model.reversal.Reversal',
      args: [
        {
          type: 'net.nanopay.kotak.model.reversal.Reversal',
          name: 'request'
        }
      ]
    }
  ]
});
