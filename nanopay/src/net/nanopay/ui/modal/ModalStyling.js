foam.CLASS({
  package: 'net.nanopay.ui.modal',
  name: 'ModalStyling',
  extends: 'foam.u2.View',

  documentation: 'Generic Modal CSS',

  css: `
    .key {
      width: 50px;
      height: 16px;
      font-size: 14px;
      font-weight: bold;
      color: /*%BLACK%*/ #1e1f21;
      margin: 3% 15% 0 5%;
      display: inline-block;
    }
    .value {
      height: 16px;
      font-size: 12px;
      line-height: 1.33;
      color: /*%BLACK%*/ #1e1f21;
      display: inline-block;
    }
    .key-value-container {
      margin-bottom: 20px;
    }
    .modal-button-container {
      width: 408px;
      height: 40px;
      position: absolute;
      bottom: 0;
      padding-left: 20px;
      padding-right: 20px;
      margin-bottom: 20px;
    }
  `
});
