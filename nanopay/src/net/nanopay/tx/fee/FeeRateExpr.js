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
  package: 'net.nanopay.tx.fee',
  name: 'FeeRateExpr',
  extends: 'foam.mlang.AbstractExpr',

  documentation: 'Returns fee rate',

  implements: [ 'foam.core.Serializable' ],

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
  ],

  properties: [
    {
      class: 'String',
      name: 'feeId'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        var dao = (DAO) getX().get("feeDAO");
        var fee = (Fee) dao.find(getFeeId());
        return fee.getRate((FObject) obj).doubleValue();
      `,
      code: function() { /* Not supported */ }
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
        return 'FeeRateExpr(\'' + this.feeId + '\')';
      },
      javaCode: ' return "FeeRateExpr(\'" + getFeeId() + "\')"; '
    }
  ]
})
