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
  name: 'BmoFileHeader',

  documentation: `BMO EFT file, file header - record type A (80 Character)`,

  javaImports: [
    'net.nanopay.tx.bmo.BmoFormatUtil',
    'java.time.LocalDate',
    'foam.core.ValidationException'
  ],

  implements: [
    'foam.core.Validatable'
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
        + BmoFormatUtil.addLeftZeros(getDestinationDataCentreCode(), 5)
        + BmoFormatUtil.blanks(54);
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
      if ( this.getFileCreationNumber() > 9999 ) {
        throw new ValidationException("File creation number can not be larger than 9999");
      }
      `
    },
  ]
});
