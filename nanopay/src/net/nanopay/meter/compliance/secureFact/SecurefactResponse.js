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
  package: 'net.nanopay.meter.compliance.secureFact',
  name: 'SecurefactResponse',

  sections: [
    {
      name: 'responseInformation'
    }
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      section: 'responseInformation',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'entityName',
      section: 'responseInformation',
      order: 20,
      gridColumns: 6
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'entityId',
      section: 'responseInformation',
      order: 30,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'type',
      factory: function() {
        return this.cls_.name;
      },
      javaFactory: `return getClass().getSimpleName();`
    },
    {
      class: 'Int',
      name: 'statusCode',
      section: 'responseInformation',
      order: 40,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'requestJson',
      section: 'responseInformation',
      order: 100
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.ResponseError',
      name: 'errors',
      section: 'responseInformation',
      order: 110
    }
  ]
});
