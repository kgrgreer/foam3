foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DisclosureLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  requires: [
    'net.nanopay.model.Disclosure',
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Disclosure',
      name: 'disclosure',
      label: 'Disclosure',
      factory: function() {
        return this.Disclosure.create();
      },
      documentation: 'Disclosure to be displayed'
    },
  ]
});
