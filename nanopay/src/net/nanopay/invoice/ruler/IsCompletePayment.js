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
  package: 'net.nanopay.invoice.ruler',
  name: 'IsCompletePayment',

  documentation: `Returns true if new object is a invoice with COMPLETED status.`,

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'static foam.mlang.MLang.*',
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return 
          EQ(DOT(NEW_OBJ, Invoice.STATUS), InvoiceStatus.PAID)
        .f(obj);
      `
    }
  ]
});
