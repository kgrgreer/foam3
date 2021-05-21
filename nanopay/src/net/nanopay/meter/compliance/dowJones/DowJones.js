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

foam.INTERFACE({
  package: 'net.nanopay.meter.compliance.dowJones',
  name: 'DowJones',

  methods: [
    {
      name: 'personNameSearch',
      type: 'net.nanopay.meter.compliance.dowJones.DowJonesResponse',
      async: true,
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'searchData',
          type: 'net.nanopay.meter.compliance.dowJones.PersonNameSearchData'
        }
      ]
    },
    {
      name: 'entityNameSearch',
      type: 'net.nanopay.meter.compliance.dowJones.DowJonesResponse',
      async: true,
      javaThrows: ['foam.nanos.auth.AuthenticationException'],
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'searchData',
          type: 'net.nanopay.meter.compliance.dowJones.EntityNameSearchData'
        }
      ]
    }
  ]
});
