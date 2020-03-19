foam.CLASS({
  package: 'net.nanopay.tx.cico',
  name: 'EFTFile',

  documentation: `Model for an EFT file`,

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
      name: 'provider',
      class: 'Reference',
      of: 'net.nanopay.payment.PaymentProvider'
    },
    {
      name: 'content',
      class: 'String',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 80 }
    },
    {
      name: 'file',
      class: 'Reference',
      of: 'foam.nanos.fs.File'
    },
    {
      name: 'receipt',
      class: 'Reference',
      of: 'foam.nanos.fs.File'
    },
    {
      name: 'report',
      class: 'Reference',
      of: 'foam.nanos.fs.File'
    },
    {
      name: 'fileCreationTimeEDT',
      class: 'String'
    },
    {
      name: 'retries',
      class: 'Int'
    },
    {
      name: 'status',
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.cico.EFTFileStatus',
    },
    {
      name: 'failureReason',
      class: 'String',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 80 }
    },
  ],
});