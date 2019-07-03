foam.CLASS({
  package: 'net.nanopay.tx.bmo.eftfile',
  name: 'BmoEftFile',

  documentation: `BMO EFT file`,

  tableColumns: [
    'id', 'fileName', 'production'
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
      name: 'production',
      class: 'Boolean',
    },
    {
      name: 'fileCreationTimeEDT',
      class: 'String'
    },
    {
      name: 'beautifyString',
      class: 'String',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 80 }
    },
    {
      name: 'headerRecord',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.bmo.eftfile.BmoFileHeader',
    },
    {
      name: 'batchRecords',
      class: 'FObjectArray',
      of: 'net.nanopay.tx.bmo.eftfile.BmoBatchRecord'
    },
    {
      name: 'trailerRecord',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.bmo.eftfile.BmoFileControl',
    }
  ],

  methods: [
    {
      name: 'toBmoFormat',
      type: 'String',
      javaCode:
      `
      String fileHeader = this.getHeaderRecord().toBmoFormat();
      
      String batchRecord = "";
      for ( BmoBatchRecord record : this.getBatchRecords() ) {
        batchRecord = batchRecord + record.toBmoFormat();
      }
      
      String fileControl = this.getTrailerRecord().toBmoFormat();
      
      return fileHeader + batchRecord + fileControl;
      `
    },
    {
      name: 'beautify',
      type: 'String',
      javaCode:
        `
      String str = this.toBmoFormat();
  
      int lineSize = 80;
  
      int index = 0;
      StringBuilder sb = new StringBuilder();
      while ( index < str.length() ) {
        sb.append(str.substring(index, index + lineSize) + System.lineSeparator());
        index = index + lineSize;
      }
  
      return sb.toString();
      `
    }
  ]
});
