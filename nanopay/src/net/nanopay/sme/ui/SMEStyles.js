foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SMEStyles',
  extends: 'foam.u2.View',

  documentation: 'SME CSS that is used through out',

  css: `
    body {
      font-family: 'Lato', sans-serif;
    }
    .stack-wrapper {
      height: calc(100% - 40px);
      padding: 0;
      background: #f9fbff;
    }
    .full-screen {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
    }
    .app-link {
      margin-left: 5px;
      color: #7404EA;
      cursor: pointer;
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
    .forgot-link {
      margin-left: 0px;
      color: #7404EA;
      cursor: pointer;
      text-align: center;
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

    /* Sidebar */

    .sme-sidenav-item-wrapper,
    .sme-quick-action-wrapper {
      border-left: 4px solid #fff;
      font-weight: normal;
    }

    .sme-sidenav-item-wrapper:hover,
    .sme-quick-action-wrapper:hover {
      background: #f3f2ff;
      cursor: pointer;
      border-left: 4px solid #604aff;
      color: #604aff;
      font-weight: 600;
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

    h1 {
      font-weight: 900;
      font-size: 32px;
    }

    h2 {
      font-weight: 700;
      font-size: 24px;
      line-height: 36px;
    }

    /* Inputs */

    .input-label {
      padding-bottom: 4px;
      font-weight: 400;
      font-size: 12px;
    }

    .input-wrapper {
      margin-top: 12px;
    }

    .input-field-wrapper {
      position: relative;
    }

    .input-field {
      width: 100%;
      font-size: 14px;
      height: 40px;
      border: solid 1px #8e9090;
      border-radius: 3px;
      padding: 12px;
    }

    textarea.input-field {
      height: auto;
    }

    input:focus {
      border: solid 1px #604aff !important;
    }

    .input-field.image {
      padding-right: 30px;
    }

    .input-image {
      position: absolute !important;
      width: 22px !important;
      height: 22px !important;
      bottom: 9px !important;
      right: 12px !important;
    }

    .input-double-left {
      display: inline-block;
      width: calc((100% - 2%) / 2);
    }
    .input-double-right {
      display: inline-block;
      width: calc((100% - 2%) / 2);
      margin-left: 2%;
    }

    .block {
      width: 100% !important;
    }
    .login {
      margin-top: 24px !important;
    }
    .sme-button {
      border-radius: 4px !important;
      background-color: #604aff;
      font-size: 16px !important;
      font-family: 'Lato', sans-serif;
      height: 48px !important;
      margin-top: 0px;
      color: #fff;
    }
    .sme-button:hover {
      background: #4d38e1 !important;
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

    /* Buttons Reference the following component style guide: https://app.zeplin.io/project/5bea24519befb87e8387dec8/screen/5bea260ad4ba093cf835ae49 */

    .sme.button {
      font-size: 16px;
      border-radius: 4px;
      font-weight: 500;
      width: 128px;
      height: 48px;
      cursor: pointer;
      text-align: center;
      font-family: 'Lato', sans-serif !important;
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
      font-family: 'Lato', sans-serif !important;
      background: none;
      line-height: 16px;
      padding: 0px;
      height: auto;
      width: auto;
      margin-right: 30px;
    }

    .sme.link:hover {
        color: #604aff;
    }

    .sme.link:hover .icon {
      display: none;
    }

    .sme.link:hover .icon.hover {
      display: inline-block;
    }

    .sme.link .icon {
      margin-right: 8px;
    }

    .sme.link .icon.hover {
      display: none;
    }

    /* Text Reference the following component style guide: https://app.zeplin.io/project/5bea24519befb87e8387dec8/screen/5bea26293d02ff3d04f8892d */

    .x-large-header {
      font-size: 40px;
      line-height: 48px;
      font-weight: 900;
    }

    .large-header {
      font-size: 32px;
      line-height: 48px;
      font-weight: 700;
    }

    .medium-header {
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
      font-size: 14px;
      line-height: 21px;
      font-weight: 400;
      color: #2b2b2b;
    }

    .table-heading {
      font-size: 14px;
      line-height: 15px;
      font-weight: 900;
    }

    .bold-label {
      font-size: 14px;
      font-weight: 900;
      line-height: 15px;
    }

    .form-label {
      font-size: 12px;
      font-weight: 700;
      line-height: 15px;
    }

    .subdued-text {
      color: #8e9090;
    }

    .caption {
      font-size: 10px;
      line-height: 15px;
      font-weight: normal;
    }

    .invoice-list-wrapper {
      border-radius: 4px;
      border: 1px solid #e2e2e3;
      overflow: hidden;
    }

    .invoice-list-wrapper > div:last-child > .net-nanopay-sme-ui-InvoiceRowView {
      border: 0;
    }

    /* DAO controller */
    
    .foam-comics-DAOControllerView .net-nanopay-ui-ActionView {
      width: 158px;
      height: 48px;
      border-radius: 4px;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      border: solid 1px #4a33f4;
      background-color: #604aff !important;
      font-family: lato;
      font-size: 16px;
    }

    .foam-comics-DAOControllerView .net-nanopay-ui-ActionView:hover {
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      border: solid 1px #4a33f4;
      background-color: #4d38e1 !important;
    }

    .foam-comics-DAOControllerView .actions {
      float: right;
      padding-top: 10px;
    }

    .foam-comics-DAOControllerView .actions .net-nanopay-ui-ActionView {
      background: none !important;
      border: none !important;
      box-shadow: none;
      font-size: 16px;
      font-weight: 500;
      color: #8e9090;
      cursor: pointer;
      font-family: 'Lato', sans-serif !important;
      margin: 0;
      width: auto;
      height: auto;
    }

    .foam-comics-DAOControllerView .actions .net-nanopay-ui-ActionView:hover {
      color: #604aff;
    }

    .foam-comics-DAOControllerView .actions .net-nanopay-ui-ActionView::before {
      background-image: url("images/ablii-logo.png");
      background: #000;
      height: 30px;
      width: 30px;
    }

    .foam-comics-DAOControllerView-top-row {
      margin-bottom: 36px !important;
    }

    .foam-comics-DAOControllerView-title-container span {
      color: #8e9090;
      height: 24px;
      font-family: Lato;
      font-size: 16px;
    }

    .foam-comics-DAOControllerView-title-container h1 span {
      font-size: 32px;
      line-height: 48px;
      font-weight: 900;
      color: #2b2b2b;
    }

    .foam-u2-search-TextSearchView input {
      box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
      border: solid 1px #e2e2e3;
      border-radius: 3px;
    }

  `
});
