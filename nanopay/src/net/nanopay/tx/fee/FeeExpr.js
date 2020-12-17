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
  package: 'net.nanopay.tx.fee',
  name: 'FeeExpr',
  extends: 'foam.mlang.AbstractExpr',

  implements: [ 'foam.core.Serializable' ],

  javaImports: [
    'foam.dao.DAO',
    'static foam.core.ContextAware.maybeContextualize',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'feeName'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'feeDAO',
      documentation: 'The feeDAO for fee lookup in f(). If going through FeeEngine, it will be set the relationship DAO from a TransactionFeeRule.',
      javaFactory: 'return (DAO) getX().get("feeDAO");',
      transient: true,
      visibility: 'HIDDEN'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return getFeeDAO().find(
          AND(
            EQ(Fee.NAME, getFeeName()),
            maybeContextualize(getX(), DOT_F(Fee.PREDICATE, obj))
          )
        );
      `,
      code: function() {
        // Fee predicate might require context therefore it must be originated
        // on the server. Client side FeeExpr is not supported.
      }
    },
    {
      name: 'deepClone',
      type: 'FObject',
      javaCode: 'return this;'
    },
    {
      name: 'toString',
      type: 'String',
      code: function() {
        return 'FeeExpr(\'' + this.feeName + '\')';
      },
      javaCode: ' return "FeeExpr(\'" + getFeeName() + "\')"; '
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public FeeExpr(String feeName) {
            setFeeName(feeName);
          }
        `);
      }
    }
  ]
})
