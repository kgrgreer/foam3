foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SMEStyles',
  extends: 'foam.u2.View',

  documentation: 'SME CSS that is used through out',

  css: `
    .stack-wrapper {
      min-height: calc(100% - 20px - 40px) !important;
      padding: 0px;
    }
    .sme-title {
      height: 30px;
      font-size: 20px;
      letter-spacing: 0.5px;
      text-align: left;
      color: #093649;
    }
    .sme-subTitle {
      font-size: 14px;
      letter-spacing: 0.5px;
      text-align: left;
      color: #093400;
      font-weight: 300;
      margin-bottom: 15px;
    }
    .sme-labels {
      font-size: 12px !important;
      color: #2b2b2b !important;
      padding-bottom: 6px !important;
      font-weight: 600 !important;
    }
    .label, .infolabel {
      font-size: 12px !important;
      color: #2b2b2b !important;
      padding-bottom: 6px !important;
      font-weight: 400 !important;
      display: block !important;
    }
    .sme-inputContainer {
      margin-top: 1%;
    }
    .sme-nameRowL {
      display: inline-block;
      width: calc((100% - 2%) / 2);
    }
    .sme-nameRowR {
      display: inline-block;
      width: calc((100% - 2%) / 2);
      margin-left: 2%;
    }
    .sme-nameFields {
      height: 40px;
      width: 100%;
      font-size: 14px;
    }
    .sme-dataFields {
      height: 40px;
      width: 100%;
      font-size: 14px;
    }
    .sme-link {
      margin-left: 5px;
      color: #7404EA;
      cursor: pointer;
    }
    .sme-button {
      position: relative;
      width: 100%;
      height: 40px;
      background: #7404ea;
      font-size: 14px;
      border: none;
      color: white;
      border-radius: 2px;
      outline: none;
      cursor: pointer;
      filter: grayscale(0%);
      margin-top: 15px;
      margin-bottom: 15px;
    }
    .sme-button:hover {
      background: #b06afb;
    }
    .net-nanopay-ui-ActionView-createNew:hover {
      background-color: #9447e5;
    }
    .sme-property-password {
      -webkit-text-security: disc;
      -moz-text-security: disc;
      text-security: disc;
      height: 40px;
      width: 100%;
      font-size: 14px;
    }
    .sme-image {
      display: inline-block;
      height: 100%;
      width: 100%;
      float: right;
    }
    .sme-text-block {
      top: 20%;
      left: 25%;
      position: absolute;
    }
    .input-field {
      padding-right: 30px;
      width: 100%;
      font-size: 14px;
      height: 40px;
    }
    .input-field-container {
      position: relative;
    }
    .input-image {
      position: absolute;
      width: 24px;
      height: 24px;
      bottom: 8px;
      right: 6px;
    }
    .forgot-link {
      margin-left: 0px;
      color: #7404EA;
      cursor: pointer;
    }
    .img-replacement {
      background: -webkit-radial-gradient(white, lightgray);
      width: 100%;
      height: 100%;
    }
    .sme-noselect {
      -webkit-touch-callout: none; /* iOS Safari */
      -webkit-user-select: none; /* Safari */
      -khtml-user-select: none; /* Konqueror HTML */
      -moz-user-select: none; /* Firefox */
      -ms-user-select: none; /* Internet Explorer/Edge */
      user-select: none; /* Non-prefixed version, currently
                            supported by Chrome and Opera */
    }
    .foam-u2-stack-StackView {
      height: 100%;
      width: 100%;
    }

    input {
      border: solid 1px #8e9090;
      border-radius: 3px;
      padding: 12px !important;
      font-size: 14px !important;
      font-family: lato, sans-serif !important;
    }

    input:focus {
      border: solid 1px #604aff !important;;
    }

    .text-input-container .labels {
      padding-bottom: 4px;
      font-weight: 400;
    }

    .login-logo-img {
      width: 80px;
      margin-bottom: 16px;
    }

    .property-filteredDAO {
      width: 100% !important;;
    }

    tbody {
      width: 100% !important;
    }

    table {
      width: 100% !important;
    }

    thead {
      background: none !important;
    }

    .net-nanopay-invoice-ui-sme-ReceivablesView {
      width: 100% !important;
    }
    .sme-sidenav-item-wrapper {
      color: #525455;
      border-left: 3px solid transparent;
    }
    .sme-sidenav-item-wrapper .current {
      background: #f3f2ff;
      color: #604aff !important;
      border-left: 3px solid #604aff;
    }
    .sme-sidenav-item-wrapper:hover {
      cursor: pointer;
      background: #f3f2ff;
      color: #604aff !important;
      border-left: 3px solid #604aff;
    }
    ^ .sme-quick-action-wrapper {
      background: #604aff;
      color: #fff !important;
      margin: 12px;
      border-radius: 3px;
      box-shadow: 0px 1px 2px rgba(0,0,0,0.2);
      cursor: pointer;
    }

    .net-nanopay-invoice-ui-sme-PayablesView {
      width: 100% !important;
    }


    /* Modal windows */

    .foam-u2-dialog-Popup-inner {
      box-shadow: 0 24px 24px 0 rgba(0, 0, 0, 0.12), 0 0 24px 0 rgba(0, 0, 0, 0.15);
      border-radius: 3px;
      overflow: hidden;
    }
    
    .container {
      width: 510px !important;
    }

    .innerContainer {
      padding: 24px;
      margin: 0px !important;
      width: auto !important;
    }

    .popUpHeader {
      background: #fff !important;
      color: #2b2b2b !important;
      padding: 24px 24px 16px 24px !important;
      width: auto !important;
      height: auto !important;
    }

    .popUpTitle {
      font-weight: 900 !important;
      font-size: 24px !important;
      color: #2b2b2b !important;
      margin: 0px !important;
    }

    .styleMargin {
      background: #fafafa;
      overflow: hidden;
      margin-top: 0 !important;
      padding: 24px !important;
    }

    .net-nanopay-ui-ActionView-addButton,
    .net-nanopay-ui-ActionView-saveButton {
      float: right;
      margin-bottom: 0px !important;
      width: 135px !important;
    }

    .net-nanopay-ui-ActionView net-nanopay-ui-ActionView-closeButton {

    }

    .description {
      display: none;
    }

    .styleReq {
      display: none !important;
    }

    .modal-checkbox-wrapper {
      margin-top: 16px;
    }

    .net-nanopay-ui-ActionView-closeButton {
      margin-right: 0px !important;
    }

    .checkbox-label {
      font-size: 16px;
    }

  `
});
