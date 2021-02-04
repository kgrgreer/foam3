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
  name: 'RefundTypes',

  values: [
    {
      name: 'SCHEDULED',
      documentation: `A status that indicates that the invoice has a scheduled
        due date, and has not been paid yet.`,
      label: { en: 'Scheduled', pt: 'Programado'},
      color: '#406dea !important'
    },
    {
      name: 'OVERDUE',
      documentation: `A status that indicates that the invoice has a passed
        due date, and has not been paid yet.`,
      label: { en: 'Overdue', pt: 'Em atraso'},
      color: '#d42035 !important'
    },
  ]
});
