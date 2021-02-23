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
