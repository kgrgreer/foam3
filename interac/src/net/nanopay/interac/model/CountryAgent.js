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
  package: 'net.nanopay.interac.model',
  name: 'CountryAgent',

  documentation: 'Model to detail the Agents responsible for sending and receiving money between the specified countries',

  properties: [
    {
      class: 'FObjectProperty',
      name: 'debtorCountry',
      of: 'foam.nanos.auth.Country'
    },
    {
      class: 'FObjectProperty',
      name: 'creditorCountry',
      of: 'foam.nanos.auth.Country'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Branch',
      name:  'debtorAgent'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.Branch',
      name:  'creditorAgent'
    },
    {
      class: 'Double',
      name:  'debtorFee'
    },
    {
      class: 'Double',
      name:  'creditorFee'
    }
  ]
});