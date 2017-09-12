
foam.CLASS({
  package: 'net.nanopay.invoice.ui.modal',
  name: 'ModalStyling',
  extends: 'foam.u2.Element',

  documentation: 'Generic Modal CSS',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          font-family: Roboto;
        }
        ^ .input-Box{
          width: 408px;
          height: 60px;
          font-size: 12px;
          font-weight: 300;
          letter-spacing: 0.2px;
          color: #093649;
          text-align: left;
        }
        ^ .Approve-Button{
          width: 135px;
          height: 40px;
          border-radius: 2px;
          background-color: #59aadd;
          cursor: pointer;
          text-align: center;
          color: #ffffff;
          font-size: 14px;
          line-height: 2.86;
          letter-spacing: 0.2px;
        }
      */}
    })
  ]
});