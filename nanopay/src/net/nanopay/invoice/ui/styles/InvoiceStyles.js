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
  package: 'net.nanopay.invoice.ui.style',
  name: 'InvoiceStyles',
  extends: 'foam.u2.View',

  documentation: 'Invoice CSS that is used for styling views associated to invoices. Implement to use.',

  css: `
    .generic-status {
      border-radius: 30px;
      padding: 3px 7px;
      display: inline;
      font-weight: 300;
    }
    .Invoice-Status-Disputed  {
      color: #c82e2e;
      background: white;
      border: 1px solid #c82e2e;
      border-radius: 30px;
      padding: 3px 7px;
      display: inline;
    }
    .Invoice-Status-Void {
      border: 1px solid black;
      color: white;
      background: black;
      border-radius: 30px;
      padding: 3px 7px;
      display: inline;
    }
    .Invoice-Status-New  {
      color: #59a5d5;
      background: white;
      border: 1px solid #262626;
      border-radius: 30px;
      padding: 3px 7px;
      display: inline;
    }
    .Invoice-Status-Overdue {
      background: #c82e2e;
      color: white;
      border-radius: 30px;
      padding: 3px 7px;
      display: inline;
    }
    .Invoice-Status-Processing {
      border: solid 1px /*%BLACK%*/ #1e1f21;
      border-radius: 30px;
      padding: 3px;
      padding-left: 9px;
      width: 50px;
      display: inline-block;
    }
    .Invoice-Status-Unpaid {
      background: #59aadd;
      color: white;
      border-radius: 30px;
      padding: 3px 7px;
      display: inline;
    }
    .Invoice-Status-Paid {
      background: #2cab70;
      color: white;
      border-radius: 30px;
      padding: 3px 7px;
      display: inline;
    }
    .Invoice-Status-Scheduled {
      color: #2cab70;
      border: 1px solid #2cab70;
      background: white;
      font-size: 10px;
      border-radius: 30px;
      padding: 3px 7px;
      display: inline;
    }
    .Invoice-Status-Pending-approval {
      background: #e49339;
      border-radius: 30px;
      padding: 3px 7px;
      display: inline;
    }
    .Invoice-Status-Draft {
      background: #666666;
      color: white;
      border-radius: 30px;
      padding: 3px 7px;
      display: inline;
    }
    .property-userList{
      height: 50px;
    }
    .generic-status{
      border-radius: 30px;
      padding: 3px 7px;
      display: inline;
    }
  `
});
