foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SMEStyles',
  extends: 'foam.u2.View',

  documentation: 'SME CSS that is used through out',

  css: `
    .stack-wrapper {
    body {
      font-family: lato, sans-serif !important;
      overflow: hidden !important;
    }
      min-height: calc(100% - 20px - 40px) !important;
      padding: 0px;
    }
    .sme-title {
      height: 30px;
      font-size: 30px;
      line-height: 1;
      letter-spacing: 0.5px;
      text-align: left;
      color: #353535;
      margin-bottom: 40px;
      font-weight: 900;
    }
    .sme-subTitle {
      font-size: 14px;
      letter-spacing: 0.5px;
      text-align: center;
      color: #093400;
      font-weight: 300;
      margin-bottom: 15px;
      margin-top: 20px;
    }
    .sme-labels {
      font-size: 12px;
      color: #2b2b2b;
      padding-bottom: 6px;
      font-weight: 600;
    }
    .sme-inputContainer {
      margin-top: 12px;
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
    .net-nanopay-ui-ActionView {
      border-radius: 4px !important;
      background-color: #604aff !important;
      font-size: 16px !important;
      font-family: lato, sans-serif !important;
      height: 48px !important;
      font-size: 16px !important;
      margin-top: 0px !important;
      color: #fff !important;
    }
    .block {
      width: 100% !important;
    }
    .login {
      margin-top: 24px !important;
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
      position: absolute !important;
      width: 22px !important;
      height: 22px !important;
      bottom: 9px !important;
      right: 12px !important;
    }
    .forgot-link {
      margin-left: 0px;
      color: #7404EA;
      cursor: pointer;
      text-align: center;
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

    /* Styles related to rich choice view */
    .net-nanopay-sme-SMEController .foam-u2-view-RichChoiceView {
      display: block;
    }

    .net-nanopay-sme-SMEController .foam-u2-view-RichChoiceView-container {
      top: 40px; // 36px for height of select input, plus 4px bottom margin
      border: 1px solid #bdbdbd;
      border-radius: 4px;
      width: 100%;
      -webkit-appearance: none;
    }

    .net-nanopay-sme-SMEController .foam-u2-view-RichChoiceView-heading {
      font-weight: bold;
      border-bottom: 1px solid #f4f4f9;
      line-height: 24px;
      font-size: 14px;
      color: #333;
      font-weight: 900;
      padding: 6px 16px;
    }

    .net-nanopay-sme-SMEController .foam-u2-view-RichChoiceView-selection-view {
      height: 36px;
      width: 100%;
      border-radius: 4px;
      border: solid 1px #bdbdbd;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px;
      font-size: 12px;
      box-sizing: border-box;
      margin-bottom: 4px;
      -webkit-appearance: none;
    }

    .net-nanopay-sme-SMEController .foam-u2-view-RichChoiceView-chevron::before {
      color: #bdbdbd;
      font-size: 17px;
      padding-left: 8px;
    }
  `
});
