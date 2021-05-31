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
  package: 'net.nanopay.country.br.tx',
  name: 'BRAFEXTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AFEXTransactionPlanner',

  documentation: 'Overrides AFEX planner create trade to fetch the POP code from partner lineitem',

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.country.br.AFEXPOPCode',
    'net.nanopay.fx.FXQuote',
    'net.nanopay.fx.afex.AFEXTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],


  methods: [
    {
      name: 'createAFEXTransaction',
      javaType: 'AFEXTransaction',
      javaCode: `
        AFEXTransaction afexTransaction = super.createAFEXTransaction(x, request, fxQuote, source);

        var popCode = findPOPCode(request, x);
        if ( popCode != null ) afexTransaction.setPOPCode(popCode);
        return afexTransaction;
      `
    },
    {
      name: 'findPOPCode',
      args: [
        {
          type: 'Transaction',
          name: 'request'
        },
        {
          type: 'Context',
          name: 'x'
        }
      ],
      javaType: 'String',
      javaCode: `
        for ( TransactionLineItem lineItem : request.getLineItems() ) {
          if ( lineItem instanceof PartnerLineItem || lineItem instanceof NatureCodeLineItem ) {
            String natureCode = lineItem instanceof PartnerLineItem ? ((PartnerLineItem) lineItem).getNatureCode()
              : ((NatureCodeLineItem) lineItem).getNatureCode();
            var popCode = ((DAO) x.get("afexPOPCodesDAO")).find(AND(
              EQ(AFEXPOPCode.PARTNER_CODE, natureCode),
              EQ(AFEXPOPCode.COUNTRY_CODE, "BR")
            ));
            return popCode == null ? null : ((AFEXPOPCode) popCode).getAfexCode();
          }
        }
        return null;
      `
    }
  ]
});
