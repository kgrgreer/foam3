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
  name: 'DateColumnOfReports',

  documentation: 'Date column for operational reports',

  values: [
    { name: 'DAILY',         label: 'Daily' },
    { name: 'YESTERDAY',     label: 'Yesterday' },
    { name: 'WEEKLY',        label: 'Weekly' },
    { name: 'MONTH_TO_DATE', label: 'Month to Date' },
    { name: 'LAST_MONTH',    label: 'Last Month' },
    { name: 'YEAR_TO_DATE',  label: 'Year to Date' },
    { name: 'TOTAL',         label: 'Total' }
  ]
});
