foam.CLASS({
  package: 'net.nanopay.tx.bmo.eftfile',
  name: 'BmoBatchControl',

  documentation: `BMO EFT file, batch control - record type Y (80 Character)`,

  javaImports: [
    'net.nanopay.tx.bmo.BmoFormatUtil'
  ],

  properties: [
    {
      name: 'logicalRecordTypeId',
      class: 'String',
      value: 'Y'
    },
    {
      name: 'batchPaymentType',
      class: 'String'
    },
    {
      name: 'batchRecordCount',
      class: 'Int'
    },
    {
      name: 'batchAmount',
      class: 'Long'
    }
  ],

  methods: [
    {
      name: 'toBmoFormat',
      type: 'String',
      javaCode:
      `
      return this.getLogicalRecordTypeId()
        + this.getBatchPaymentType()
        + BmoFormatUtil.addLeftZeros(this.getBatchRecordCount(), 8)
        + BmoFormatUtil.addLeftZeros(this.getBatchAmount(), 14)
        + BmoFormatUtil.blanks(56);
      `
    }
  ]
});
