/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  name: 'MockSecurefactService',
  extends: 'net.nanopay.meter.compliance.secureFact.SecurefactService',

  documentation: `A Mock Securefact service which spoofs SIDni and LEV APIs
    for individual identity verification and business entity search.`,

  javaImports: [
    'net.nanopay.meter.compliance.secureFact.SecurefactResponseGenerator',
  ],

  methods: [
    {
      name: 'sendRequest',
      type: 'net.nanopay.meter.compliance.secureFact.SecurefactResponse',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'request',
          type: 'net.nanopay.meter.compliance.secureFact.SecurefactRequest'
        },
        {
          name: 'responseClass',
          javaType: 'java.lang.Class'
        }
      ],
      javaCode: `
        return SecurefactResponseGenerator.spoofSecurefactResponse(x, request);      
      `
    }
  ]
});
