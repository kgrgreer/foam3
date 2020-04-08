foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DisclosureLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      documentation: 'Disclosure Text',
      name: 'text',
      class: 'String',
      view: { class: 'net.nanopay.ui.DisclosureView', data: this }
    },
  ],

});
