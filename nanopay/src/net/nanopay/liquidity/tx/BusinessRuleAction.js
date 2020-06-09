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

foam.ENUM({
  package: 'net.nanopay.liquidity.tx',
  name: 'BusinessRuleAction',
  documentation: 'Type of action to be specified for a  business rule.',

  values: [
    {
      name: 'ALLOW',
      label: 'Allow',
      documentation: 'Allows the operation to proceed.'
    },
    {
      name: 'RESTRICT',
      label: 'Restrict',
      documentation: 'Restricts the operation from proceeding.'
    },
    {
      name: 'NOTIFY',
      label: 'Notify',
      documentation: 'Sends a notification that the operaiton is happening.'
    },
    {
      name: 'APPROVE',
      label: 'Approve',
      documentation: 'Sends an approval requests for the given transaction.'
    }
  ]
});
