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
  ]
});
