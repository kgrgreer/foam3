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
  package: 'net.nanopay.tx',
  name: 'Amount',

  properties: [
    {
      class: 'String',
      name: 'Unit',
      documentation: `
        The id of the Unit that the amount is in.
      `,
      required: true
    },
    {
      class: 'Long',
      name: 'quantity',
      documentation: `
        The quantity of the Unit
      `,
      required: true
    }
  ]
});
