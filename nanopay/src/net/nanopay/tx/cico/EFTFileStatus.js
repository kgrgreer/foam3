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

foam.ENUM({
  package: 'net.nanopay.tx.cico',
  name: 'EFTFileStatus',

  documentation: 'Status for EFT/AFT file. Purpose of the status is tom indicate the state of EFT/AFT files. ',

  values: [
    {
      name: 'GENERATED',
      label: 'Generated',
      documentation: 'EFT/AFT File has been generated and ready for sending out.',
      ordinal: 0
    },
    {
      name: 'SENT',
      label: 'Sent',
      documentation: 'EFT/AFT File has been sent out successfully.',
      ordinal: 1
    },
    {
      name: 'ACCEPTED',
      label: 'Accepted',
      documentation: 'EFT/AFT File was accepted and valid.',
      ordinal: 2
    },
    {
      name: 'FAILED',
      label: 'Failed',
      documentation: 'EFT/AFT File failed while sending out.',
      ordinal: 3
    },
    {
      name: 'REJECTED',
      label: 'Rejected',
      documentation: 'EFT/AFT File was rejected or not accepted.',
      ordinal: 4
    },
    {
      name: 'PENDING',
      label: 'Pending',
      documentation: 'EFT/AFT File is pending.',
      ordinal: 5
    },
    {
      name: 'PROCESSED',
      label: 'Processed',
      documentation: 'EFT/AFT File has been processed successfully..',
      ordinal: 6
    },
  ]
});
