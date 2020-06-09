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
  name: 'DowJonesRestInterface',

  methods: [
    {
      name: 'serve',
      type: 'net.nanopay.meter.compliance.dowJones.DowJonesResponseMsg',
      args: [
        {
          name: 'msg',
          type: 'net.nanopay.meter.compliance.dowJones.DowJonesRequestMsg'
        },
        {
          name: 'requestInfo',
          type: 'String'
        }
      ]
    },
    {
      name: 'baseSearchService',
      type: 'net.nanopay.meter.compliance.dowJones.DowJonesResponseMsg',
      args: [
        {
          name: 'msg',
          type: 'net.nanopay.meter.compliance.dowJones.DowJonesRequestMsg'
        }
      ]
    },
    {
      name: 'request',
      type: 'net.nanopay.meter.compliance.dowJones.DowJonesResponseMsg',
      args: [
        {
          name: 'req',
          type: 'net.nanopay.meter.compliance.dowJones.DowJonesRequestMsg'
        }
      ]
    }
  ]
});
