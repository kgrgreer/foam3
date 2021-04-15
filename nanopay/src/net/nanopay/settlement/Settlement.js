/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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

// TODO: add created, createdBy, maybe a status? - can be for now boolean just isSucceeded

 foam.CLASS({
  package: 'net.nanopay.settlement',
  name: 'Settlement',

  documentation: 'The base model for Settlements in regards to Central Bank.',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Enum',
      of: 'net.nanopay.settlement.SettlementTypes',
      name: 'type'
    }
  ]
});
