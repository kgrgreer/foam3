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
  package: 'net.nanopay.meter.compliance.secureFact.lev',
  name: 'LEVIndividualScores',

  properties: [
    {
      class: 'String',
      name: 'nameScore',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'numberScore',
      order: 20,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'formationDateScore',
      order: 30,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'jurisdictionScore',
      order: 40,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'typeScore',
      order: 50,
      gridColumns: 6
    }
  ]
});
