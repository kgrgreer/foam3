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
  package: 'net.nanopay.tx.rbc',
  name: 'RbcTransaction',

  methods: [
    {
      name: 'setRbcReferenceNumber',
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
      name: 'getRbcReferenceNumber',
      type: 'String'
    },
    {
      name: 'setRbcFileCreationNumber',
      type: 'void',
      args: [
        {
          class: 'Long',
          name: 'referenceNumber',
        },
      ]
    },
    {
      name: 'getRbcFileCreationNumber',
      type: 'Long',
      javaType: 'long'
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
