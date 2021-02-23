/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.tx.bmo.eftfile',
  name: 'BmoEftFile',
  extends: 'net.nanopay.tx.cico.EFTFile',

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
