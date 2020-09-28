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
  package: 'net.nanopay.flinks.external',
  name: 'AsyncStatus',

  documentation: 'Status of an async call.',

  values: [
    { 
      name: 'IN_PROGRESS',
      label: 'In Progress',
      documentation: 'Async call is in progress.'
    },
    {
      name: 'COMPLETED',
      label: 'Completed',
      documentation: 'Async call is completed.'
    },
    {
      name: 'FAILURE',
      label: 'Failure',
      documentation: 'There was a failure in the async call.'
    },
    {
      name: 'CANCELLED',
      label: 'Cancelled',
      documentation: 'The async call was cancelled.'
    }
  ]
});
