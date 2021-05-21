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
  package: 'net.nanopay.meter.reports',
  name: 'RowOfBusSumReports',

  documentation: 'Type row for business summary reports',

  values: [
    { name: 'REGISTRATION',           label: 'Registration' },
    { name: 'APPLICATION_SUBMITTED',  label: 'Application Submitted' },
    { name: 'APPROVED',               label: 'Approved' },
    { name: 'ACTIVE',                 label: 'Active' },
    { name: 'DECLINED',               label: 'Declined' },
    { name: 'LOCKED',                 label: 'Locked' }
  ]
});
