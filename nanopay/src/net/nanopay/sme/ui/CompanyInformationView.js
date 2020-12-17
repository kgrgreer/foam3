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
  package: 'net.nanopay.sme.ui',
  name: 'CompanyInformationView',
  extends: 'foam.u2.View',

  documentation: `
    View detailing company/business information.
  `,

  css: `
    ^ .net-nanopay-sme-ui-PaymentCodeView {
      margin-top: 16px;
    }
    ^ .net-nanopay-sme-ui-TransactionLimitView {
      margin-top: 16px;
    }
    ^ .net-nanopay-sme-ui-BeneficialOwnerView {
      margin-top: 16px;
    }
    ^ .card:hover {
      box-shadow: none;
    }
  `,

  properties: [
    { 
      class: 'Boolean',
      name: 'paymentCodePermission'
    },
    { 
      class: 'Boolean',
      name: 'txnLimitPermission'
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .tag({ class: 'net.nanopay.sme.ui.BusinessInformationView' })
        .callIf(this.paymentCodePermission, function() { this.tag({ class: 'net.nanopay.sme.ui.PaymentCodeView' }) })
        .callIf(this.txnLimitPermission, function() { this.tag({ class: 'net.nanopay.sme.ui.TransactionLimitView' }) })
        .tag({ class: 'net.nanopay.sme.ui.BeneficialOwnerView' });
    }
  ]
});
