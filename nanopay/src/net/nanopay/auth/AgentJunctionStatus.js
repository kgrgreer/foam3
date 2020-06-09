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
  package: 'net.nanopay.auth',
  name: 'AgentJunctionStatus',
  documentation: 'Describes the status between agent and entity on their junction.',
   values: [
    {
      name: 'ACTIVE',
      label: 'Active',
      documentation: 'Junction is satisfied and agent may act as entity.'
    },
    {
      name: 'DISABLED',
      label: 'Disabled',
      documentation: 'Junction is unsatisfied disabling agent from acting as entity.'
    },
    {
      name: 'INVITED',
      label: 'Invited',
      documentation: 'The person has been invited to join the business.'
    }
  ]
});
