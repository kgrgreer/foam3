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
      font-size: 14px;
      color: #093649;
      font-family: Roboto;
      margin-bottom: 1px;
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
    .foam-u2-search-TextSearchView input {
      background-image: url("images/ic-search.svg");
      background-repeat: no-repeat;
      background-position: 8px;
      border-radius: 2px;
      border: 1px solid #dce0e7;
      color: #093649;
      font-size: 14px;
      height: 40px;
      padding: 0 21px 0 38px;
    }
    .foam-u2-stack-StackView {
      height: 100%;
      width: 100%;
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
