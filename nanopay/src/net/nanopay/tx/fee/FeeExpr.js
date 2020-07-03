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

  imports: [
    'DAO feeDAO'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'feeName'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return getFeeDAO().find(
          AND(
            EQ(Fee.NAME, getFeeName()),
            DOT_F(Fee.PREDICATE, obj)
          )
        );
      `,
      code: function(obj) {
        var E = foam.mlang.Expressions.create();
        return this.feeDAO.find(
          E.AND(
            E.EQ(net.nanopay.tx.fee.Fee.NAME, this.feeName),
            E.DOT_F(net.nanopay.tx.fee.Fee.PREDICATE, obj)
          )
        );
      }
    },
    {
      name: 'toString',
      type: 'String',
      javaCode: ' return "FeeExpr(\'" + getFeeName() + "\')"; '
    }
  ]
})
