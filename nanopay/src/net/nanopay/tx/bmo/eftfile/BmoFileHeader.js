foam.CLASS({
  package: 'net.nanopay.tx.bmo.eftfile',
  name: 'BmoFileHeader',

  documentation: `BMO EFT file, file header - record type A (80 Character)`,

  javaImports: [
    'net.nanopay.tx.bmo.BmoFormatUtil',
    'java.time.LocalDate'
  ],

  properties: [
    {
      name: 'logicalRecordTypeId',
      class: 'String',
      value: 'A'
    },
    {
      name: 'originatorId',
      class: 'String'
    },
    {
      name: 'fileCreationNumber',
      class: 'Int'
    },
    {
      name: 'fileCreationDate',
      class: 'String',
      documentation: 'Julian file creation date, pattern: 0YYDDD'
    },
    {
      name: 'destinationDataCentreCode',
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
        + this.getOriginatorId() 
        + BmoFormatUtil.addLeftZeros(this.getFileCreationNumber(), 4)
        + getFileCreationDate()
        + getDestinationDataCentreCode()
        + BmoFormatUtil.blanks(54);
      `
    }
  ]
});
