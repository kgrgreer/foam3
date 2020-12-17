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
  name: 'BmoBatchControl',

  documentation: `BMO EFT file, batch control - record type Y (80 Character)`,

  javaImports: [
    'net.nanopay.tx.bmo.BmoFormatUtil',
    'foam.core.ValidationException'
  ],

  implements: [
    'foam.core.Validatable'
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
    },
    {
      name: 'validate',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaCode: `
      if ( this.getBatchRecordCount() > 99999999 ) {
        throw new ValidationException("Batch record count bigger than 99999999." );
      }
  
      if ( this.getBatchAmount() > 99999999999999L ) {
        throw new ValidationException("Batch amount larger than 99999999999999." );
      }
      `
    },
  ]
});
