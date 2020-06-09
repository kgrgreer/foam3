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
    package: 'net.nanopay.tx.ruler',
    name: 'InvoiceApprovedByRule',

    documentation: 'Set approved by on invoices',

    implements: [
      'foam.nanos.ruler.RuleAction'
    ],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.nanos.auth.Subject',
      'foam.nanos.auth.User',

      'java.util.Date',

      'net.nanopay.invoice.model.Invoice',
      'net.nanopay.invoice.model.PaymentStatus'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
            ((Invoice) obj).setApprovalDate(new Date());
            ((Invoice) obj).setApprovedBy(((Subject) x.get("subject")).getUser().getId());
        `
      }
    ]
  });
