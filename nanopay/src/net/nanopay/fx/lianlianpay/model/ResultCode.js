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
  package: 'net.nanopay.fx.lianlianpay.model',
  name: 'ResultCode',

  documentation: 'Response code',

  values: [
    {
      name: 'BATCH_PRE_PROCESS_SUCCESS',
      label: 'Batch pre-process success',
      ordinal: 4000
    },
    {
      name: 'BATCH_PRE_PROCESS_FAILED',
      label: 'Batch pre-process failed',
      ordinal: 4001
    },
    {
      name: 'BATCH_PRE_PROCESS_PARTIAL_SUCCESS',
      label: 'Batch pre-process partial success',
      ordinal: 4002
    },
    {
      name: 'INSTRUCTION_PRE_PROCESS_SUCCESS',
      label: 'Instruction pre-process success',
      ordinal: 4010
    },
    {
      name: 'INSTRUCTION_FORMAT_INCORRECT',
      label: 'Instruction format incorrect',
      ordinal: 4100
    },
    {
      name: 'ORDER_ID_ALREADY_EXISTS',
      label: 'orderId of instruction already exists',
      ordinal: 4199
    },
    {
      name: 'KYC_APPROVED',
      label: 'KYC approved',
      ordinal: 4200
    },
    {
      name: 'KYC_AUDIT_PROCESSING',
      label: 'KYC audit processing',
      ordinal: 4201
    },
    {
      name: 'KYC_FAILED',
      label: 'KYC failed',
      ordinal: 4210
    },
    {
      name: 'KYC_DENIED',
      label: 'KYC denied by risk control',
      ordinal: 4230
    },
    {
      name: 'INSUFFICIENT_MERCHANT_BALANCE_FOR_FX',
      label: 'Insufficient merchant account balance for FX',
      ordinal: 6007
    },
    {
      name: 'FX_SETTLEMENT_FAILED',
      label: 'FX settlement failed',
      ordinal: 6011
    },
    {
      name: 'INSUFFICIENT_MERCHANT_BALANCE_FOR_PAYMENT',
      label: 'Insufficient merchant account balance for payment',
      ordinal: 7004
    },
    {
      name: 'MERCHANT_ACCOUNT_STATE_EXCEPTION',
      label: 'Merchant account state exception',
      ordinal: 7005
    },
    {
      name: 'PAYMENT_SUCCESS',
      label: 'Payment success',
      ordinal: 8000
    },
    {
      name: 'PAYEE_BANK_ACCOUNT_INCORRECT',
      label: 'Payee bank account name or number incorrect',
      ordinal: 8002
    },
    {
      name: 'PAYEE_BANK_ACCOUNT_STATE_EXCEPTION',
      label: 'Payee bank account state exception',
      ordinal: 8009
    },
    {
      name: 'PAYMENT_FAILED',
      label: 'Payment failed',
      ordinal: 8888
    }
  ]
});
