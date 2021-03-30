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
  package: 'net.nanopay.tx.model',
  name: 'TransactionStatus',

  documentation: 'Status for transactions. Purpose of each status would depend on the implementation. The documentation in this file will descibe only existing models.',

  values: [
    {
      name: 'PENDING',
      label: { en: 'Pending', pt: 'Pendente'},
      documentation: 'CICO: as soon as cico transaction is created it takes PENDING status until it is sent to EFT.',
      ordinal: 0,
      color: '/*%GREY1%*/ #5e6061',
      background: '/*%GREY4%*/ #e7eaec',
    },
    {
      // deprecated
      name: 'REVERSE',
      label: { en: 'Reverse', pt: 'Marcha ré'},
      documentation: 'DEPRECATED. CICO: after transaction was marked as COMPLETED we might receive rejection file from EFT. We attempt to reverse balance - REVERSE status occurs when balance reverted successfully. Should never be set manully, the status is calculated.',
      ordinal: 1,
      color: '/*%WARNING1%*/ #816819',
      background: '/*%WARNING4%*/ #fbe88f'
    },
    {
      // deprecated
      name: 'REVERSE_FAIL',
      label: { en: 'ReverseFail', pt: 'ReversaFalha'},
      documentation: 'DEPRECATED. CICO: after transaction was marked as COMPLETED we might receive rejection file from EFT. We attempt to reverse balance - REVERSE_FAIL status occurs when balance failed to revert. Should never be set manully, the status is calculated.',
      ordinal: 2,
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #fbedec',
    },
    {
      name: 'SENT',
      label: { en: 'Sent', pt: 'Enviado'},
      documentation: 'CICO: transaction takes status SENT when automatically generated CSV file with transactions is sent to EFT.',
      ordinal: 3,
      color: '/*%WARNING1%*/ #816819',
      background: '/*%WARNING4%*/ #fbe88f'
    },
    {
      name: 'DECLINED',
      label: { en: 'Declined', pt: 'Recusado'},
      documentation: 'CICO: transaction that was rejected by EFT.',
      ordinal: 4,
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #fbedec'
    },
    {
      name: 'COMPLETED',
      label: { en: 'Completed', pt: 'Concluído'},
      documentation: 'Base transaction: status indicating that transaction was successfully proccessed. CICO: after waiting period(2days), we assume transaction was successfully proccessed.',
      ordinal: 5,
      color: '/*%APPROVAL2%*/ #117a41',
      background: '/*%APPROVAL5%*/ #e2f2dd',
    },
    {
      // deprecated
      name: 'REFUNDED',
      label: { en: 'Refunded', pt: 'Devolveu'},
      documentation: 'DEPRECATED. Retail transaction: status of a transaction that was refunded.',
      ordinal: 6,
      color: '/*%WARNING1%*/ #816819',
      background: '/*%WARNING4%*/ #fbe88f'
    },
    {
      name: 'FAILED',
      label: { en: 'Failed', pt: 'Fracassado'},
      documentation: 'CICO: in case confirmation files indicates invalid transactions, those transactions take FAILED status.',
      ordinal: 9,
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #fbedec',
    },
    {
      name: 'PAUSED',
      label: { en: 'Paused', pt: 'Pausa'},
      documentation: 'CICO: PAUSED transactions are being ignored by the system. Example: transaction was voided on EFT portal, the transaction should be marked as PAUSED within the system.', // REVIEW
      ordinal: 10,
      color: '/*%WARNING1%*/ #816819',
      background: '/*%WARNING4%*/ #fbe88f'
    },
    {
      name: 'CANCELLED',
      label: { en: 'Cancelled', pt: 'Cancelado'},
      ordinal: 11,
      color: '/*%DESTRUCTIVE2%*/ #a61414',
      background: '/*%DESTRUCTIVE5%*/ #fbedec'
    },
    {
      name: 'PENDING_PARENT_COMPLETED',
      label: { en: 'Pending Parent Completed', pt: 'Pai pendente concluído'},
      documentation: 'Chained transaction: child transactions are in PENDING_PARENT_COMPLETED and being ignored by the system until all parents go to COMPLETED state.',
      ordinal: 12,
      color: '/*%GREY1%*/ #5e6061',
      background: '/*%GREY4%*/ #e7eaec'
    },
    {
      name: 'SCHEDULED',
      label: { en: 'Scheduled', pt: 'Scheduled'},
      documentation: 'Scheduled transaction specifies the time when transaction needs to be processsed.',
      ordinal: 13,
      color: '/*%GREY1%*/ #5e6061',
      background: '/*%GREY4%*/ #e7eaec',
    }
  ]
});
