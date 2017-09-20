
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
          color: #093649;
          margin: 3% 15% 0 5%;
          display: inline-block;
        }
        .value{
          height: 16px;
          font-size: 12px;
          line-height: 1.33;
          color: #093649;
          display: inline-block;
        }
        .key-value-container{
          margin-bottom: 20px;
        }
        .modal-button-container{
          width: 408px;
          height: 40px;
          position: absolute;
          bottom: 0;
          padding-left: 20px;
          padding-right: 20px;
          margin-bottom: 20px;
         }
      */}
    })
  ]
});