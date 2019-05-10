foam.CLASS({
  package: 'net.nanopay.tx.bmo.eftfile',
  name: 'BmoDetailRecord',

  documentation: `BMO EFT file, detail record - 'C' or 'D' (80 Character)`,

  javaImports: [
    'net.nanopay.tx.bmo.BmoFormatUtil',
    'java.time.LocalDate'
  ],

  properties: [
    {
      name: 'logicalRecordTypeId',
      class: 'String'
    },
    {
      name: 'amount',
      class: 'Long'
    },
    {
      name: 'clientInstitutionId',
      class: 'String',
      documentation: 'payee / payor institution ID, pattern: 0BBBTTTTT, '
    },
    {
      name: 'clientAccountNumber',
      class: 'String',
      documentation: 'payee / payor account number'
    },
    {
      name: 'clientName',
      class: 'String'
    },
    {
      name: 'referenceNumber',
      class: 'String',
      documentation: 'Cross reference number, customer ID to reference item. e.g. Employee SIN number.'
    }
  ],

  methods: [
    {
      name: 'toBmoFormat',
      type: 'String',
      javaCode:
      `
      return this.getLogicalRecordTypeId()
        + BmoFormatUtil.addLeftZeros(this.getAmount(), 10)
        + "0" + this.getClientInstitutionId()
        + BmoFormatUtil.addRightBlanks(this.getClientAccountNumber(), 12)
        + BmoFormatUtil.addRightBlanks(this.getClientName(), 29)
        + BmoFormatUtil.addRightBlanks(this.getReferenceNumber(), 19);
      `
    }
  ]
});
