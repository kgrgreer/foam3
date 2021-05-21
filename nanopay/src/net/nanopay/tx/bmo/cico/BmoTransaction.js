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

foam.INTERFACE({
  package: 'net.nanopay.tx.bmo.cico',
  name: 'BmoTransaction',

  methods: [
    {
      name: 'setBmoReferenceNumber',
      type: 'void',
      args: [
        {
          type: 'String',
          name: 'referenceNumber',
          section: 'transactionInformation',
          order: 370,
          gridColumns: 6
        },
      ]
    },
    {
      name: 'getBmoReferenceNumber',
      type: 'String'
    },
    {
      name: 'setBmoFileCreationNumber',
      type: 'void',
      args: [
        {
          class: 'Int',
          name: 'referenceNumber',
        },
      ]
    },
    {
      name: 'getBmoFileCreationNumber',
      type: 'Int',
      javaType: 'int'
    },
    {
      name: 'setRejectReason',
      args: [
        {
          type: 'String',
          name: 'rejectReason'
        }
      ],
      type: 'void'
    },
    {
      name: 'getRejectReason',
      type: 'String',
    },
    {
      name: 'setSettled',
      args: [
        {
          type: 'Boolean',
          name: 'settled'
        }
      ],
      type: 'void'
    },
    {
      name: 'getSettled',
      type: 'Boolean'
    }
  ]
});
