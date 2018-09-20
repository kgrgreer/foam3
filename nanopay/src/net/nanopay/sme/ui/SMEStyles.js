foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SMEStyles',
  extends: 'foam.u2.View',

  documentation: 'SME CSS that is used through out',

  css: `
    .sme-createView {
      margin-top: 15%;
      margin-right: 25%;
      margin-bottom: 25%;
      margin-left: 30%;
    }
    .sme-registration-container {
      width: 400px;
    }
    .stack-wrapper {
      padding-top: 0px !important;
      padding-bottom: 0px !important;
    }
    .sme-title {
      height: 30px;
      font-size: 20px;
      line-height: 1;
      letter-spacing: 0.5px;
      text-align: left;
      color: #093649;
      margin-bottom: -5px;
    } 
    .sme-subTitle {
      font-size: 12px;
      letter-spacing: 0.5px;
      text-align: left;
      color: #093400;
      margin-bottom: 15px;
      font-weight: 300;
    }   
    .sme-labels {
      font-size: 10px;
      color: #093649;
      font-family: Roboto;
      margin-top: 13px;
      margin-bottom: 1px;
    } 
    .sme-inputContainer {
      margin-top: 1%;
    }
    .sme-passwrdInputContainer {
      margin-top: 5%;
      margin-bottom: 5%;
    }
    .sme-nameInputContainer {
      margin-top: -3%;
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
      background-color: #eeeeee;
      width: 100%;
      font-size: 12px;
    }
    .sme-dataFields {
      background-color: #eeeeee;
      width: 100%;
      font-size: 12px;
    }
    .sme-link {
      margin-left: 5px;
      color: #7404EA;
      cursor: pointer;
      text-decoration-line: underline;
    }
    .net-nanopay-ui-ActionView-createNew {
      position: relative;
      width: 100%;
      height: 27px;
      background-color: #7404ea;
      font-size: 12px;
      border: none;
      color: white;
      border-radius: 2px;
      outline: none;
      cursor: pointer;
      filter: grayscale(0%);
      margin-bottom: 5%;
    }
    .net-nanopay-ui-ActionView-createNew:hover {
      background-color: #9447e5;
    }
    .sme-property-password {
      -webkit-text-security: disc;
      -moz-text-security: disc;
      text-security: disc;
      background-color: #eeeeee;
      width: 100%;
      font-size: 12px;
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
    .content-form {
      width: 260px;
      display: table-cell;
      vertical-align: middle;
      padding-left: 20px;
      padding-right: 20px;
    }
    .input-field {
      padding-right: 30px;
      width: 100%;
      font-size: 14px;
      height: 40px;
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
      background: -webkit-radial-gradient(pink, cyan);
      width: 100%;
      height: 100%;
    }
  `
});
