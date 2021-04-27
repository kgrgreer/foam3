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
  package: 'net.nanopay.meter.report',
  name: 'ReportStatus',

  values: [
    {
      name: 'IN_PROCESS',
      ordinal: 0,
      color: '/*%WARNING1%*/ #865400',
      background: '/*%WARNING4%*/ #FFF3C1'
    },
    {
      name: 'COMPLETED',
      ordinal: 1,
      color: '/*%APPROVAL1%*/ #04612E',
      background: '/*%APPROVAL5%*/ #EEF7ED'
    }
  ]
});
