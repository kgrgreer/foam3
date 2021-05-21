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
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaVerificationTransaction',
  extends: 'net.nanopay.tx.cico.VerificationTransaction',

  properties: [
    {
      class: 'String',
      name: 'confirmationLineNumber',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'returnCode',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'returnDate',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'returnType',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'padType'
    },
    {
      class: 'String',
      name: 'txnCode'
    },
    {
      class: 'String',
      name: 'description',
      visibility: 'RO'
    },
  ],
  methods: [
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          type: 'net.nanopay.tx.model.Transaction'
        },
      ],
      javaCode: `
        super.limitedCopyFrom(other);
        if ( other instanceof AlternaVerificationTransaction) {
          setConfirmationLineNumber(((AlternaVerificationTransaction)other).getConfirmationLineNumber());
          setReturnCode(((AlternaVerificationTransaction)other).getReturnCode());
          setReturnDate(((AlternaVerificationTransaction)other).getReturnDate());
          setReturnType(((AlternaVerificationTransaction)other).getReturnType());
          setPadType(((AlternaVerificationTransaction)other).getPadType());
          setTxnCode(((AlternaVerificationTransaction)other).getTxnCode());
          setDescription(((AlternaVerificationTransaction)other).getDescription());
        }
      `
    },
  ]
});
