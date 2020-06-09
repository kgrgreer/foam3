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

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'entityName'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'entityId'
    },
    {
      class: 'Int',
      name: 'statusCode'
    },
    {
      class: 'String',
      name: 'requestJson',
      view: {
        class: 'io.c9.ace.Editor',
        config: {
          width: 600, height: 200,
          mode: 'JSON',
          isReadOnly: true
        }
      }
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.ResponseError',
      name: 'errors'
    }
  ]
});
