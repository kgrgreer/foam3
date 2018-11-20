foam.INTERFACE({
  package: 'net.nanopay.kotak',
  name: 'Kotak',

  documentation: 'Interface for Kotak API',

  methods: [
    {
      name: 'initiatePayment',
      returns: 'Promise',
      javaReturns: 'net.nanopay.kotak.model.AcknowledgementType',
      args: [
        {
          class: 'FObjectProperty',
          of: 'net.nanopay.kotak.model.InitiateRequest',
          name: 'request'
        }
      ]
    },
    {
      name: 'initiateReversal',
      returns: 'Promise',
      javaReturns: 'net.nanopay.kotak.model.Reversal',
      args: [
        {
          class: 'FObjectProperty',
          of: 'net.nanopay.kotak.model.Reversal',
          name: 'request'
        }
      ]
    }
  ]
});
