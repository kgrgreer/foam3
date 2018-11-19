
foam.CLASS({
  package: 'net.nanopay.invoice.ui.style',
  name: 'InvoiceStyles',
  extends: 'foam.u2.View',

  documentation: 'Invoice CSS that is used for styling views associated to invoices. Implement to use.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
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
        .Invoice-Status-Pending{
          border: solid 1px #093649;
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
        .foam-u2-view-TableView-th-id  {width: 80px;}
        .foam-u2-view-TableView-th-invoiceNumber  { width: 80px; }
        .foam-u2-view-TableView-th-purchaseOrder  { width: 80px; }
        .foam-u2-view-TableView-th-payerName { width: 150px; }
        .foam-u2-view-TableView-th-payeeName   { width: 150px; }
        .foam-u2-view-TableView-th-payerId { width: 150px; }
        .foam-u2-view-TableView-th-payeeId   { width: 150px; }
        .foam-u2-view-TableView-th-paymentDate      { width: 90px; }
        .foam-u2-view-TableView-th-issueDate      { width: 90px; }
        .foam-u2-view-TableView-th-dueDate      { width: 90px; }
        .foam-u2-view-TableView-th-amount         { width: 90px; padding-right:20px; }
        .foam-u2-view-TableView-th-status         { width: 130px; }
      */}
    })
  ]
});
