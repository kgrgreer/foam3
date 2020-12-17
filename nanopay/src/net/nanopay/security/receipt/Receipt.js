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
  package: 'net.nanopay.security.receipt',
  name: 'Receipt',

  documentation: `Modelled receipt class used for issuing receipts for objects
    stored in the Merkle Tree along with the signature for the top hash.`,

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'FObjectProperty',
      name: 'data',
      documentation: `Data object for which the receipt is being issued for.
        This is being stored in the leaf node.`
    },
    {
      class: 'net.nanopay.security.HexString',
      name: 'signature',
      documentation: 'Hex encoded signature used for signing the root hash.'
    },
    {
      class: 'net.nanopay.security.HexStringArray',
      name: 'path',
      documentation: `Path in the Merkle Tree to where the data is located.
        When following this path and combining the hashes, one should be able to
        re-create the Merkle Tree.`
    },
    {
      class: 'Int',
      name: 'dataIndex',
      documentation: `The index in the Merkle tree array of the data object.
        This is used to determine if the first hash in the path array is to be
        concatenated to the left (odd) or right (even).`
    }
  ]
});
