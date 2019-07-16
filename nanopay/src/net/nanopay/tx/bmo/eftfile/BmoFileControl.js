foam.CLASS({
  package: 'net.nanopay.tx.bmo.eftfile',
  name: 'BmoFileControl',

  documentation: `BMO EFT file, file control record - Type z (80 Character)`,

  javaImports: [
    'net.nanopay.tx.bmo.BmoFormatUtil'
  ],

  properties: [
    {
      name: 'logicalRecordTypeId',
      class: 'String',
      value: 'Z'
    },
    {
      name: 'totalValueOfD',
      class: 'Long'
    },
    {
      name: 'totalNumberOfD',
      class: 'Int'
    },
    {
      name: 'totalValueOfC',
      class: 'Long',
    },
    {
      name: 'totalNumberOfC',
      class: 'Int'
    }
  ],

  methods: [
    {
      name: 'toBmoFormat',
      type: 'String',
      javaCode:
      `
      return this.getLogicalRecordTypeId()
        + BmoFormatUtil.addLeftZeros(this.getTotalValueOfD(), 14)
        + BmoFormatUtil.addLeftZeros(this.getTotalNumberOfD(), 5)
        + BmoFormatUtil.addLeftZeros(this.getTotalValueOfC(), 14)
        + BmoFormatUtil.addLeftZeros(this.getTotalNumberOfC(), 5)
        + BmoFormatUtil.blanks(41);
      `
    }
  ]
});
