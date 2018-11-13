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

    /* Buttons Reference the following component style guide: https://app.zeplin.io/project/5bea24519befb87e8387dec8/screen/5bea260ad4ba093cf835ae49 */

    .sme.button {
        font-size: 16px;
        border-radius: 4px;
        font-weight: 500;
        width: 128px;
        height: 48px;
        cursor: pointer;
        text-align: center;
        font-family: lato, sans-serif !important;
    }

    .sme.button:focus {
        outline: none;
    }

    .sme.button:active {
        box-shadow: inset 0 2px 1px 0 rgba(32, 46, 120, 0.54);
    }

    .sme.button.secondary:active {
        box-shadow: inset 0 2px 1px 0 rgba(32, 46, 120, 0.34);
    }

    .sme.button.primary {
        background: #604aff;
        color: #fff;
        border: none;
    }

    .sme.button.primary:hover {
        background: #4d38e1;
    }

    .sme.button.secondary {
        background: #fff;
        color: #604aff;
        border: 1px solid #604aff;
    }

    .sme.button.secondary:hover {}

    .sme.button.error {
        background: #f91c1c;
        color: #fff;
        border: none;
    }

    .sme.button.error:hover {
        background: #da1818;
    }

    .sme.button.error.secondary {
        background: #fff;
        color: #f91c1c;
        border: 1px solid #f91c1c;
    }

    .sme.button.medium {
        width: 96px;
        height: 36px;
        font-size: 14px;
    }

    .sme.button.small {
        width: 70px;
        height: 24px;
        font-size: 10px;
    }

    .sme.button.error.secondary:hover {}

    /* Link */

    .sme.link {
        font-size: 16px;
        font-weight: 500;
        color: #8e9090;
        cursor: pointer;
        font-family: lato, sans-serif !important;
    }

    .sme.link:hover {
        color: #604aff;
    }

    /* Text Reference the following component style guide: https://app.zeplin.io/project/5bea24519befb87e8387dec8/screen/5bea26293d02ff3d04f8892d */

    x-large-header {
      font-size: 40px;
      line-height: 48px;
      font-weight: 900;
    }

    large-header {
      font-size: 32px;
      line-height: 48px;
      font-weight: 700;
    }

    medium-header {
      font-size: 24px;
      line-height: 36px;
      font-weight: 700;
    }

    .medium-intro {
      font-size: 24px;
      line-height: 36px;
      font-weight: 400;
    }

    .subheading {
      font-size: 16px;
      line-height: 24px;
      font-weight: 700;
    }

    .body-paragraph {
      font-size: 16px;
      line-height: 24px;
      font-weight: 400;
    }

    .table-content {
      font-size: 10px;
      line-height: 15px;
      font-weight: 400;
    }

    .caption {
      font-size: 10px;
      line-height: 15px;
      font-weight: normal;
    }

  `
});
