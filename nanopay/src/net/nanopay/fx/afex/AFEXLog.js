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
  package: 'net.nanopay.fx.afex',
  name: 'AFEXLog',

  javaImports: [
    'java.util.Date'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
    },
    {
      class: 'String',
      name: 'apiKey'
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'request'
    },
    {
      class: 'String',
      name: 'response',
    },
    {
      class: 'DateTime',
      name: 'requestTime',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'responseTime',
      visibility: 'RO'
    }
  ],

    methods: [
    {
      name: 'logRequest',
      args: [
        {
          name: 'request',
          type: 'String'
        }
      ],
      javaCode: `
      setRequest(request);
      setRequestTime(new Date());
      `
    },
    {
      name: 'logResponse',
      args: [
        {
          name: 'response',
          type: 'String'
        }
      ],
      javaCode: `
      setResponse(response);
      setResponseTime(new Date());
      `
    }
  ]
});
