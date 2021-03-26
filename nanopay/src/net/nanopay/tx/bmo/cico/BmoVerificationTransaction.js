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
  package: 'net.nanopay.tx.bmo.cico',
  name: 'BmoVerificationTransaction',
  extends: 'net.nanopay.tx.cico.VerificationTransaction',

  javaImports: [
    'java.util.ArrayList',
    'java.util.Arrays',
    'net.nanopay.tx.bmo.BmoFormatUtil',
    'net.nanopay.tx.bmo.BmoTransactionHistory',
    'foam.core.FObject',
    'java.util.List'
  ],

  implements: [
    'net.nanopay.tx.bmo.cico.BmoTransaction'
  ],

  properties: [
    {
      name: 'bmoReferenceNumber',
      class: 'String'
    },
    {
      name: 'bmoFileCreationNumber',
      class: 'Int'
    },
    {
      name: 'rejectReason',
      class: 'String'
    },
    {
      name: 'settled',
      class: 'Boolean'
    }
  ],

  methods: [
    {
      name: 'addHistory',
      args: [
        {
          name: 'history', type: 'String'
        }
      ],
      type: 'Void',
      javaCode: `
        BmoTransactionHistory bmoHistory = new BmoTransactionHistory();
        bmoHistory.setTimeEDT(BmoFormatUtil.getCurrentDateTimeEDT());
        bmoHistory.setMessage(history);
        this.getExternalData().put("BMO History", bmoHistory);
      `
    },
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
        if ( other instanceof BmoVerificationTransaction ) {
          setBmoReferenceNumber( ((BmoVerificationTransaction) other).getBmoReferenceNumber() );
          setBmoFileCreationNumber( ((BmoVerificationTransaction) other).getBmoFileCreationNumber() );
          setRejectReason( ((BmoVerificationTransaction) other).getRejectReason() );
          setSettled( ((BmoVerificationTransaction) other).getSettled() );
        }
      `
    }
  ]
});
