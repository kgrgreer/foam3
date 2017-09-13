
foam.CLASS({
  package: 'net.nanopay.ui.modal',
  name: 'ModalStyling',
  extends: 'foam.u2.View',

  documentation: 'Generic Modal CSS',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        .key{
          width: 50px;
          height: 16px;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.2px;
          color: #093649;
          margin: 3% 15% 0 5%;
          display: inline-block;
        }
        .value{
          height: 16px;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          color: #093649;
          display: inline-block;
        }
      */}
    })
  ]
});