foam.CLASS({
  package: 'net.nanopay.tx.rbc.iso20022file',
  name: 'RbcISO20022File',

  documentation: `RBC ISO20022 file`,

  tableColumns: [
    'id', 'fileName'
  ],

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'fileName',
      class: 'String'
    },
    {
      name: 'fileCreationTimeEDT',
      class: 'String'
    },
    {
      name: 'content',
      class: 'String',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 80 }
    },
  ],
});
