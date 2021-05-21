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
  package: 'net.nanopay.security',
  name: 'RandomNonceDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO decorator which randomly generates 128 bits to use as an ID',

  javaImports: [
    'foam.util.SafetyUtil',
    'foam.util.SecurityUtil',
    'org.bouncycastle.util.encoders.Hex'
  ],

  axioms: [
    {
      buildJavaClass: function (cls) {
        cls.extras.push(`
          public RandomNonceDAO(foam.dao.DAO delegate) {
            setDelegate(delegate);
          }
        `);
      }
    }
  ],

  properties: [
    {
      /** The property to set uniquely. */
      class: 'String',
      name: 'property',
      value: 'id'
    },
    {
      type: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      name: 'axiom',
      javaFactory: 'return (foam.core.PropertyInfo)(getOf().getAxiomByName(getProperty()));'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        synchronized ( this ) {
          if ( SafetyUtil.isEmpty((String) getAxiom().get(obj)) ) {
            byte[] bytes = new byte[16];
            SecurityUtil.GetSecureRandom().nextBytes(bytes);
            getAxiom().set(obj, Hex.toHexString(bytes));
          }
        }

        return super.put_(x, obj);
      `
    }
  ]
});
