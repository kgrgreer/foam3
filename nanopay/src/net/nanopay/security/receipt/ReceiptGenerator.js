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
  package: 'net.nanopay.security.receipt',
  name: 'ReceiptGenerator',

  documentation: `
    Receipt generator interface for usage with ReceiptGeneratingDAO.
  `,

  implements: [
    'foam.nanos.NanoService'
  ],

  methods: [
    {
      name: 'add',
      documentation: `
        Adds an FObject to the receipt generator. An FObject added
        here will be able to have a receipt generated for it later.
      `,
      javaThrows: [
        'java.lang.InterruptedException'
      ],
      args: [
        {
          type: 'foam.core.FObject',
          name: 'obj'
        }
      ]
    },
    {
      name: 'build',
      documentation: `
        Optional intermediate step that builds necessary models
        (i.e. a Merkle Tree) from which to generate receipts.
      `,
    },
    {
      name: 'generate',
      documentation: `
        Generates a receipt given an FObject.
      `,
      type: 'net.nanopay.security.receipt.Receipt',
      javaThrows: [
        'java.lang.InterruptedException'
      ],
      args: [
        {
          type: 'foam.core.FObject',
          name: 'obj'
        }
      ]
    }
  ]
});
