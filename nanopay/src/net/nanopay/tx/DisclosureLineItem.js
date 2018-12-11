foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DisclosureLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  requires: [
    'net.nanopay.disclosure.Disclosure',
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.disclosure.Disclosure',
      name: 'disclosure',
      label: 'Disclosure',
      factory: function() {
        return this.Disclosure.create();
      },
      documentation: 'Disclosure to be displayed'
    },
  ]
});
