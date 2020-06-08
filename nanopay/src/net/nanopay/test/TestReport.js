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
  package: 'net.nanopay.test',
  name: 'TestReport',
  documentation: 'Model to store meta-data on tests.',

  ids: [ 'time' ],

  properties: [
    {
      class: 'DateTime',
      name: 'time',
      documentation: 'Timestamp of the latest report.'
    },
    {
      class: 'Long',
      name: 'totalTests',
      value: 0,
      documentation: 'Total number of tests currently in the system.'
    }
  ],
});
