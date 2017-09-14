
foam.CLASS({
  package: 'net.nanopay.invoice.ui.style',
  name: 'InvoiceStyles',
  extends: 'foam.u2.View',

  documentation: 'Invoice CSS that is used for styling views associated to invoices.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        .Invoice-Status-Disputed  {
          color: #c82e2e;
          background: white;
          border: 1px solid #c82e2e;
        }
        .Invoice-Status-New  {
          color: #262626;
          background: white;
          border: 1px solid #262626;
        }
        .Invoice-Status-Overdue {
          background: #c82e2e;
          color: white;
        }
        .Invoice-Status-Due {
          background: #59aadd;
          color: white;
        }
        .Invoice-Status-Paid {
          background: #20b020;
          color: white;
        }
        .Invoice-Status-Scheduled {
          color: #20b020;
          border: 1px solid #20b020;
          background: white;
        }
        .Invoice-Status-Pending-Approval {
          color: #093649;
          border: 1px solid #093649;
          background: white;
        }
        .Invoice-Status-Draft {
          color: #666666;
        }
        .generic-status{
          border-radius: 30px;
          padding: 3px 7px;
          display: inline;
        }
      */}
    })
  ]
});