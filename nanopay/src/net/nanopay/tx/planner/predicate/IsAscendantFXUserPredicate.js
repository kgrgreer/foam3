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
  package: 'net.nanopay.tx.planner.predicate',
  name: 'IsAscendantFXUserPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if the payer is an AFEX User',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.util.SafetyUtil',
    'net.nanopay.fx.ascendantfx.AscendantFXUser',
    'net.nanopay.tx.TransactionQuote',

    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
      FObject nu  = (FObject) NEW_OBJ.f(obj);
      if ( ! ( nu instanceof TransactionQuote ) ) return false;
      TransactionQuote tq = (TransactionQuote) nu;
      return ! SafetyUtil.isEmpty(AscendantFXUser.getUserAscendantFXOrgId(((X) obj),  
        tq.getSourceAccount().getOwner()));
      
      `
    }
  ]
});