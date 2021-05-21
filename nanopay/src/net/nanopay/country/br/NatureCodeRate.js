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
  package: 'net.nanopay.country.br',
  name: 'NatureCodeRate',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.country.br.NatureCode',
      name: 'natureCode'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country',
      documentation: 'NatureCode specific country.',
    },
    {
      class: 'Double',
      name: 'iof',
      value: 0
    },
    {
      class: 'Double',
      name: 'irs',
      value: 0
    }
  ]
});
