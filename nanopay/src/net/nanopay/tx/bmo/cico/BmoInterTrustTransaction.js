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
  name: 'BmoInterTrustTransaction',
  extends: 'net.nanopay.tx.cico.InterTrustTransaction',

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
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          type: 'net.nanopay.tx.model.Transaction'
        },
      ],
      javaCode: `
        super.limitedCopyFrom(other);
        if ( other instanceof BmoInterTrustTransaction ) {
          setBmoReferenceNumber( ((BmoInterTrustTransaction) other).getBmoReferenceNumber() );
          setBmoFileCreationNumber( ((BmoInterTrustTransaction) other).getBmoFileCreationNumber() );
          setRejectReason( ((BmoInterTrustTransaction) other).getRejectReason() );
          setSettled( ((BmoInterTrustTransaction) other).getSettled() );
        }
      `
    },
    {
      name: 'calculateErrorCode',
      javaCode: `
        if ( getErrorCode() != 0 ) return getErrorCode();
        String reason = getRejectReason();
        if ( reason.contains("EFT File Rejected") ) {
          setErrorCode(991l);
        } else if ( reason.contains("INST. ID INVALID") ) {
          setErrorCode(923l);
        } else if ( reason.contains("ACCOUNT NO. INVALID") ) {
          setErrorCode(912l);
        } else if ( reason.contains("PAYEE PAYOR NAME INVALID") ) {
          setErrorCode(914l);
        } else if ( reason.contains("DEST. INST. NOT DEFINED ON FIF") ) {
          setErrorCode(923l);
        } else if ( reason.contains("DEST. ACCT. NO. INVALID") ) {
          setErrorCode(912l);
        } else {
          setErrorCode(991l);
        }
        return getErrorCode();
      `
    }
  ]
});
