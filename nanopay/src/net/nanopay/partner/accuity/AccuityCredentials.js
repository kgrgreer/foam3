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
  package: 'net.nanopay.partner.accuity',
  name: 'AccuityCredentials',

  axioms: [
    foam.pattern.Singleton.create()
  ],

  javaImports: [
    'java.time.LocalDateTime',
    'java.time.ZoneId',
    'java.util.Date'
  ],

  properties: [
    {
      class: 'String',
      name: 'baseUrl'
    },
    {
      class: 'String',
      name: 'username'
    },
    {
      class: 'String',
      name: 'password'
    },
    {
      class: 'String',
      name: 'token',
      documentation: 'Security token for API access.',
      javaPostSet: `
        setTokenExpiry_(Date.from(
          LocalDateTime.now()
            .plusMinutes(getTokenTTL())
            .minusSeconds(10) // minus 10 seconds connection timeout
            .atZone(ZoneId.systemDefault())
            .toInstant()
        ));
      `
    },
    {
      class: 'Int',
      name: 'tokenTTL',
      documentation: `
        The "time of live" of the token in minutes.

        Default to 10 minutes according to "https://documents.applyfinancial.co.uk/validate-api-2/security-token/".
      `,
      value: 10
    },
    {
      class: 'Date',
      name: 'tokenExpiry_',
      documentation: 'The expiry time of the token.'
    }
  ],

  methods: [
    {
      name: 'getValidToken',
      type: 'String',
      javaCode: `
        if ( ! foam.util.SafetyUtil.isEmpty(getToken())
          && getTokenExpiry_() != null
          && getTokenExpiry_().after(new Date())
        ) {
          return getToken();
        }
        return null;
      `
    }
  ]
});
