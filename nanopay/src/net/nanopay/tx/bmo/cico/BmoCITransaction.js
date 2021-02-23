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
  name: 'BmoCITransaction',
  extends: 'net.nanopay.tx.cico.CITransaction',

  implements: [
    'net.nanopay.tx.bmo.cico.BmoTransaction'
  ],

  properties: [
    {
      name: 'bmoReferenceNumber',
      class: 'String',
      section: 'transactionInformation',
      order: 450,
      gridColumns: 6
    },
    {
      name: 'bmoFileCreationNumber',
      class: 'Int',
      section: 'transactionInformation',
      order: 460,
      gridColumns: 6
    },
    {
      name: 'rejectReason',
      class: 'String',
      section: 'transactionInformation',
      order: 470,
      gridColumns: 6
    },
    {
      name: 'settled',
      class: 'Boolean',
      section: 'transactionInformation',
      order: 480,
      gridColumns: 6
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
        if ( other instanceof BmoCITransaction ) {
          setBmoReferenceNumber( ((BmoCITransaction) other).getBmoReferenceNumber() );
          setBmoFileCreationNumber( ((BmoCITransaction) other).getBmoFileCreationNumber() );
          setRejectReason( ((BmoCITransaction) other).getRejectReason() );
          setSettled( ((BmoCITransaction) other).getSettled() );
        }
      `
    },
    {
      name: 'calculateErrorCode',
      javaCode: `
        String reason = getRejectReason();
        if ( reason.contains("EFT File Rejected") ) {
          return 991;
        } else if ( reason.contains("INST. ID INVALID") ) {
          return 923l;
        } else if ( reason.contains("ACCOUNT NO. INVALID") ) {
          return 912l;
        } else if ( reason.contains("PAYEE PAYOR NAME INVALID") ) {
          return 914l;
        } else if ( reason.contains("DEST. INST. NOT DEFINED ON FIF") ) {
          return 923l;
        } else if ( reason.contains("DEST. ACCT. NO. INVALID") ) {
          return 912l;
        } else {
          return 991l;
        }
      `
    }
  ]
});
