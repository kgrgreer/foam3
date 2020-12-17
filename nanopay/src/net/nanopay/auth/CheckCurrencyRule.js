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
  package: 'net.nanopay.auth',
  name: 'CheckCurrencyRule',

  documentation: 'Checks if user has permission to work with a currency.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService'
  ],

  messages: [
    {
      name: 'LACKS_PERMISSION',
      message: 'You do not have permission to work with this currency: '
    }
  ],

  properties: [
    {
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      name: 'property',
      documentation: `
        The property that should be checked. The property's value should be the
        id of a Currency object.
      `
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( ! hasPermission(x, obj) ) {
          String currency = (String) getProperty().get(obj);
          throw new AuthorizationException(LACKS_PERMISSION + currency);
        }
      `
    },
    {
      name: 'hasPermission',
      type: 'Boolean',
      args: [
        { name: 'x',   type: 'Context' },
        { name: 'obj', type: 'foam.core.FObject' },
      ],
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        String currency = (String) getProperty().get(obj);
        return auth.check(x, "currency.read." + currency);
      `
    }
  ]
});
