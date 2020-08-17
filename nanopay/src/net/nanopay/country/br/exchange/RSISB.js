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
  name: 'RSISB',
  values: [
    {
      name: 'P',
      label: 'CAM0021 (Individualized Primary Market)'
    },
    {
      name: 'A',
      label: 'Bacen File (Foreign Exchange Correspondent)'
    },
    {
      name: 'R',
      label: 'CAM0009 - STR (Purchase)'
    },
    {
      name: 'B',
      label: 'CAM0006 - BMF (Purchase)'
    },
    {
      name: 'C',
      label: 'CAM0009 - STR (For sale)'
    },
  ]
});
