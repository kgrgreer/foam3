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
  name: 'AccuityAPIResponse',

  documentation: 'Represent response from Accuity Validate API.',

  javaImports: [
    'java.util.Date',
    'java.util.Map'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'Map',
      name: 'data'
    },
    {
      class: 'String',
      name: 'request',
      documentation: 'HTTP request string in the form of "METHOD /path/to/resource?param1=value1&param2=value2". Used for retrieving the cached response data.',
      required: true
    },
    {
      class: 'Date',
      name: 'expirationDate',
      documentation: 'The expiration date of the cached response data.',
      javaFactory: 'return new Date();'
    }
  ],

  methods: [
    {
      name: 'get',
      type: 'String',
      args: [
        { name: 'key', type: 'String' }
      ],
      javaCode: `
        return getValue(key, String.class);
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public <T> T getValue(String key, Class<T> type) {
            Object value = getData().get(key);
            if ( value instanceof Map
              && type.isAssignableFrom(AccuityAPIResponse.class)
            ) {
              value = new AccuityAPIResponse.Builder(getX())
                .setData((Map) value)
                .setExpirationDate(getExpirationDate())
                .build();
            }

            try { return (T) value; }
            catch (ClassCastException e) {
              return null;
            }
          }
        `);
      }
    }
  ]
});
