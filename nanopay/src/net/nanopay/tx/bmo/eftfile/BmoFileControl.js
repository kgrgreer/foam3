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
