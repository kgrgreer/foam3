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

foam.ENUM({
  package: 'net.nanopay.ticket',
  name: 'RefundStatus',

  values: [
    {
      name: 'AVAILABLE',
      label: 'Available',
      documentation: `
        A status that indicates that the ReversalTicket is awaiting 
        input from users.
      `
    },
    {
      name: 'REQUESTED',
      label: 'Requested',
      documentation: `
        A status that indicates that the ReversalTicket is awaiting 
        approval by the system and approving users
      `
    },
    {
      name: 'APPROVED',
      label: 'Approved',
      documentation: `
        A status that indicates that the ReversalTicket has been approved
        and is awaiting to be actioned on
      `
    },
    {
      name: 'PROCESSING',
      label: 'Processing',
      documentation: `
        A status that indicates that the ReversalTicket is currently processing
      `
    },
    {
      name: 'COMPLETED',
      label: 'Completed',
      documentation: `
        A status that indicates that the ReversalTicket has completed processing
      `
    },
    {
      name: 'DECLINED',
      label: 'Declined',
      documentation: `
        A status that indicates that the ReversalTicket has been rejected either
        by the system or approving user
      `
    }
  ]
});
