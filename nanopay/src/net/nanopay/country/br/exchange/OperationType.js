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
  package: 'net.nanopay.country.br.exchange',
  name: 'OperationType',
  values: [
    {
      name: '01',
      label: 'Export'
    },
    {
      name: '02',
      label: 'Import'
    },
    {
      name: '03',
      label: 'Foreign Financial Transfer'
    },
    {
      name: '04',
      label: 'Financial Transfer Abroad'
    },
    {
      name: '05',
      label: 'Banking Purchase'
    },
    {
      name: '06',
      label: 'Banking Sale'
    },
    {
      name: '07',
      label: 'Arbitration'
    },
  ]
});
