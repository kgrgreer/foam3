foam.CLASS({
  package: 'net.nanopay.tx.bmo.eftfile',
  name: 'BmoBatchRecord',

  documentation: `This record should include the batch header record, a set of detail records, and the batch control record.`,

  properties: [
    {
      name: 'batchHeaderRecord',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.bmo.eftfile.BmoBatchHeader',
    },
    {
      name: 'detailRecords',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.bmo.eftfile.BmoDetailRecord'
    },
    {
      name: 'batchControlRecord',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.bmo.eftfile.BmoBatchControl'
    }
  ],

  methods: [
    {
      name: 'toBmoFormat',
      type: 'String',
      javaCode:
        `
      String details = "";
      for ( BmoDetailRecord detailRecord : this.getDetailRecords()) {
        details = details + detailRecord.toBmoFormat();
      }
  
      return this.getBatchHeaderRecord().toBmoFormat() +
        details +
        this.getBatchControlRecord().toBmoFormat();
      `
    }
  ]
});
