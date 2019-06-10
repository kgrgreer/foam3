foam.CLASS({
  package: 'net.nanopay.tx.bmo.eftfile',
  name: 'BmoBatchHeader',

  documentation: `BMO EFT file, batch header - record type X (80 Character)`,

  javaImports: [
    'net.nanopay.tx.bmo.BmoFormatUtil',
    'java.time.LocalDate'
  ],

  properties: [
    {
      name: 'logicalRecordTypeId',
      class: 'String',
      value: 'X'
    },
    {
      name: 'batchPaymentType',
      class: 'String'
    },
    {
      name: 'transactionTypeCode',
      class: 'Int'
    },
    {
      name: 'payableDate',
      class: 'String',
      documentation: 'Julian date on which funds are payable'
    },
    {
      name: 'originatorShortName',
      class: 'String'
    },
    {
      name: 'originatorLongName',
      class: 'String'
    },
    {
      name: 'institutionIdForReturns',
      class: 'String',
      documentation: 'pattern: "0BBBTTTTT", institution ID for returns where 0 = constant, BBB = bank, TTTTT = branch transit'
    },
    {
      name: 'accountNumberForReturns',
      class: 'String'
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
        + this.getTransactionTypeCode()
        + this.getPayableDate()
        + BmoFormatUtil.addRightBlanks(this.getOriginatorShortName(), 15)
        + BmoFormatUtil.addRightBlanks(this.getOriginatorLongName(), 30)
        + this.getInstitutionIdForReturns()
        + BmoFormatUtil.addRightBlanks(this.getAccountNumberForReturns(), 12)
        + BmoFormatUtil.blanks(3);
      `
    }
  ]
});
