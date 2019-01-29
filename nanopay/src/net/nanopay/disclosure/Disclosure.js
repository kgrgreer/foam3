foam.CLASS({
  package: 'net.nanopay.disclosure',
  name: 'Disclosure',

  documentation: 'Captures disclosure information.',

  properties: [
    {
      class: 'Long',
      name: 'id',
      required: true
    },
    {
      class: 'String',
      name: 'transactionType',
      label: 'Transaction Type',
      documentation: 'Type of transaction that the disclosure applies to.',
      required: true
    },
    {
      class: 'String',
      name: 'name',
      label: 'Name',
      documentation: 'Name of disclosure.',
      required: true
    },
    {
      documentation: 'Disclosure Text',
      name: 'text',
      class: 'String',
      view: { class: 'net.nanopay.ui.DisclosureView', data: this.text }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      documentation: 'For Country specific disclosures,'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Region',
      name: 'state',
      documentation: 'For State/Province/Region specific disclosures'
    },
  ]
});
