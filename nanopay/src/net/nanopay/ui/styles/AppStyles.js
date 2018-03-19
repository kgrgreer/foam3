
foam.CLASS({
  package: 'net.nanopay.ui.style',
  name: 'AppStyles',
  extends: 'foam.u2.View',

  documentation: 'Generic CSS that is used through out the Nanopay platform. Please Reference when styling views. Implements to class use.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*

        body {
          font-family: 'Roboto', sans-serif;
          font-size: 14px;
          letter-spacing: 0.2px;
          color: #373a3c;
          background: #edf0f5;
          margin: 0;
        }
        table {
          border-collapse: collapse;
          margin: auto;
          width: 962px;
        }
        thead > tr > th {
          font-family: 'Roboto';
          font-size: 14px;
          background-color: %TABLECOLOR%;
          color: #093649;
          line-height: 1.14;
          letter-spacing: 0.3px;
          border-spacing: 0;
          text-align: left;
          padding-left: 15px;
          height: 40px;
        }
        tbody > tr > th > td {
          font-size: 12px;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
          padding-left: 15px;
          height: 60px;
        }
        .foam-u2-DetailView {
          background: #fafafa;
          border: 1px solid grey;
        }
        .foam-u2-DetailView .foam-u2-DetailView {
          width: auto;
          margin: inherit;
        }
        .foam-u2-DetailView-title {
          background: #ddd;
          color: gray;
          padding: 6px;
        }
        .foam-u2-view-TableView th {
          font-family: 'Roboto';
          padding-left: 15px;
          font-size: 14px;
          line-height: 1;
          letter-spacing: 0.4px;
          color: #093649;
        }
        .foam-u2-view-TableView td {
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          padding-left: 15px;
          font-size: 12px;
          color: #093649;
        }
        .foam-u2-view-TableView tbody > tr {
          height: 60px;
          background: white;
        }
        .foam-u2-view-TableView tbody > tr:nth-child(odd) {
          background: #f6f9f9;
        }
        .net-nanopay-ui-ActionView{
          border: none;
          outline: none;
        }
        .net-nanopay-ui-ActionView-create {
          background: %SECONDARYCOLOR%;
          border: none;
          box-shadow: none;
          color: white;
          font-weight: 100;
          width: 135px;
          height: 39px;
        }
        .net-nanopay-ui-ActionView-back {
          position: absolute;
          top: 110px;
          width: 135px;
          height: 40px;
          border-radius: 2px;
          background-color: rgba(164, 179, 184, 0.1);
          box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
          color: black;
        }
        .foam-u2-view-ReciprocalSearch-filter {
          margin-bottom: 8px;
        }
        .foam-u2-search-TextSearchView input {
          width: 288px;
          padding: 3px;
        }
        .foam-u2-search-GroupBySearchView select {
          font-family: monospace;
          font-size: 9pt;
        }
        .net-nanopay-ui-ActionView {
          padding: 4px 16px;
          text-decoration: none;
        }
        .net-nanopay-ui-ActionView-deleteDraft {
          background-color: rgba(164, 179, 184, 0.1);
          border: solid 1px #8C92AC;
          color: #093649;
          font-size: 14px;
        }
        .net-nanopay-ui-ActionView-saveAndPreview {
          background-color: %SECONDARYCOLOR%;
          color: white;
          font-size: 14px;
          float: right;
          border: 1px solid %SECONDARYCOLOR%;
        }
        .net-nanopay-ui-ActionView-saveAndPreview:hover {
          opacity: 0.9;
        }
        .net-nanopay-ui-ActionView-saveAsDraft {
          background-color: #EDF0F5;
          border: solid 1px #59A5D5;
          color: #59A5D5;
          margin-right: 15px;
          float: right;
        }
        .row {
          display: inline-block;
          width: 100%;
        }
        .rowTopMarginOverride {
          margin-top: 0;
        }
        .spacer {
          display: inline-block;
        }
        .spacer:first-child {
          margin-left: 0;
        }
        .input-box{
          width: 90%;
          height: 60px;
          margin-left: 5%;
          font-size: 12px;
          font-weight: 300;
          color: #093649;
          text-align: left;
          border: 1px solid lightgrey;
        }
         .half-input-box {
           width: 50%;
           height: 60px;
           border: solid 1px rgba(164, 179, 184, 0.5);
           padding-left: 5px;
           padding-right: 5px;
           display: block;
           margin-top: 8px;
           outline: none;
         }
         .half-small-input-box {
           width: 50%;
           height: 40px;
           border: solid 1px rgba(164, 179, 184, 0.5);
           padding: 15px;
           display: block;
           margin-top: 8px;
           outline: none;
         }
        .small-input-box{
          font-size: 12px;
          padding: 0px 5px;
          width: 215px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          outline: none;
        }
        .btn{
          width: 135px;
          height: 40px;
          border-radius: 2px;
          cursor: pointer;
          text-align: center;
          font-size: 14px;
          line-height: 2.86;
        }
        .blue-button{
          background-color: %SECONDARYCOLOR%;
          color: #ffffff;
          margin: 20px 20px;
          float: right;
        }
        .blue-button:hover{
          opacity: 0.9;
        }
        .grey-button{
          background-color: rgba(164, 179, 184, 0.1);
          border: solid 1px #8C92AC;
          color: #093649;
        }
        .white-blue-button{
          border: solid 1px %SECONDARYCOLOR%;
          color: %SECONDARYCOLOR%;
          background: none;
        }
        .full-width-button{
          width: 90%;
          height: 40px;
          border-radius: 2px;
          border: solid 1px %SECONDARYCOLOR%;
          margin: 0 auto;
          background-color: %SECONDARYCOLOR%;
          text-align: center;
          line-height: 40px;
          cursor: pointer;
          color: #ffffff;
          margin-top: 10px;
        }
        .full-width-input{
          width: 90%;
          height: 40px;
          margin-left: 5%;
          margin-bottom: 15px;
          outline: none;
          padding: 10px;
          font-size: 14px;
        }
        .label{
          height: 16px;
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          text-align: left;
          color: #093649;
          margin-bottom: 8px;
          margin-left: 15px;
        }
        .link{
          color: #59a5d5;
          cursor: pointer;
        }
        .light-roboto-h2 {
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          color: #093649;
          opacity: 0.6;
          margin-bottom: 30px;
          display: inline-block;
          white-space: nowrap;
        }
        .green-border-container{
          display: inline-block;
          border-radius: 4px;
          border: solid 1px #1cc2b7;
        }
        .property-password{
          text-security:disc;
          -webkit-text-security:disc;
          -mox-text-security:disc;
        }
        .property-confirmPassword{
          text-security:disc;
          -webkit-text-security:disc;
          -mox-text-security:disc;
        }
         .button-row {
           width: 1004px;
           margin-bottom: 30px;
         }
         .white-container {
           width: 964px;
           background: white;
           padding: 20px;
         }
        .inline{
          display: inline-block;
        }
        .hide{
          display: none;
        }
        .float-left{
          float: left;
        }
        .float-right{
          float: right;
        }
        .thin-align{
          font-weight: 100;
          margin: 10px 0 0 0;
        }
        .blue-card-title{
          
          display: block;
          width: 135px;
          height: 70px;
          padding-top: 30px;
          border-radius: 2px;
          background-color: %SECONDARYCOLOR%;
          text-align: center;
          color: white;
          font-weight: 16px;
          display: inline-block;
        }
        .net-nanopay-ui-ActionView-signIn{
          margin-left: 25px !important;
        }
        .arrow-down {
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid lightgrey;
        }
        .error-label{
          float: right;
          font-size: 8px;
          color: red;
        }
        .property-amount {
          width: 408px;
          height: 40px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          outline: none;
          margin-left: 20px;
          border-radius: 5px;
          padding: 10px;
        }
        .amount-Color-Green {
          color: #2cab70;
        }
        .amount-Color-Red {
          color: #f33d3d;
        }
        .foam-u2-view-TableView-noselect {
          width: 1px;
          font-size: 25px !important;
          cursor: pointer;
          text-align: right !important;
        }
        .foam-u2-view-TableView-noselect:hover {
          opacity: 0.9;
        }
        .foam-u2-dialog-Popup.popup-with-topnav {
          margin-top: 65px;
          z-index: 10000;
        }
        .net-nanopay-ui-ActionView-signUp{
          position: relative;
          width: 100% !important;
          height: 40px;
          background: none;
          background-color: %SECONDARYCOLOR%;
          font-size: 14px;
          border: none;
          color: white;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          filter: grayscale(0%);
        }
        .net-nanopay-ui-ActionView-signUp:hover{
          background: none;
          background-color: %SECONDARYCOLOR%;
        }
        .net-nanopay-ui-ActionView-close{
          width: 30px;
          height: 30px;
          position: absolute;
          left: 0px;
          top: -5px;
          z-index: 101;
          opacity: 0.01;
        }
        .close-x {
          position: absolute;
          width: 32px;
          height: 32px;
          opacity: 0.3;
        }
        .close-x:hover {
          opacity: 1;
        }
        .close-x:before, .close-x:after {
          position: absolute;
          content: ' ';
          height: 20px;
          width: 2px;
          background-color: #333;
        }
        .close-x:before {
          transform: rotate(45deg);
        }
        .close-x:after {
          transform: rotate(-45deg);
        }
        .stepTopMargin {
          margin-top: 0;
        }
        .net-nanopay-ui-ActionView-close{
          width: 30px;
          height: 30px;
          position: absolute;
          left: 0px;
          top: -5px;
          z-index: 101;
          opacity: 0.01;
        }
        .infoLabel {
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          color: #093649;
        }
        .inputSmall {
          width: 65px;
          height: 40px;
          margin-top: 8px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          outline: none;
          padding: 10px;
          font-size: 14px;
        }
        .inputMedium {
          width: 143px;
          height: 40px;
          margin-top: 8px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          outline: none;
          padding: 10px;
          font-size: 14px;
        }
        .inputLarge {
          width: 218px;
          height: 40px;
          margin-top: 8px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          outline: none;
          padding: 10px;
          font-size: 14px;
        }
        .inputExtraLarge {
          width: 100%;
          height: 40px;
          margin-top: 8px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          padding: 10px;
          outline: none;
          font-size: 14px;
        }
        .infoContainer {
          width: 496px;
          height: 290px;
          background: white;
          border-radius: 2px;
          overflow-y: scroll;
          padding: 20px;
        }
        .bottomMargin {
          margin-bottom: 20px;
        }
        .boxTitle {
          opacity: 0.6;
          font-family: 'Roboto';
          font-size: 20px;
          font-weight: 300;
          line-height: 20px;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
          display: inline-block;
          vertical-align: top;
        }

        .Compliance-Status-Requested {
          margin-left: 5px;
          width: 77px;
          height: 20px;
          display: inline-block;
        }
        .Compliance-Status-Requested span {
          width: 59px;
          height: 20px;
          font-size: 12px;
          line-height: 1.67;
          letter-spacing: 0.2px;
          color: #ffffff;
          padding: 0 10px 0 10px;
          border-radius: 100px;
          background-color: #59a5d5;
        }
        .Compliance-Status-Passed {
          margin-left: 5px;
          width: 62px;
          height: 20px;
          display: inline-block;
        }
        .Compliance-Status-Passed span {
          width: 42px;
          height: 20px;
          font-size: 12px;
          line-height: 1.67;
          letter-spacing: 0.2px;
          color: #ffffff;
          padding: 0 10px 0 10px;
          border-radius: 100px;
          background-color: #1cc2b7;
        }
        .Compliance-Status-Failed {
          margin-left: 5px;
          width: 53px;
          height: 20px;
          display: inline-block;
        }
        .Compliance-Status-Failed span {
          width: 34px;
          height: 20px;
          font-size: 12px;
          line-height: 1.67;
          letter-spacing: 0.2px;
          color: #ffffff;
          padding: 0 10px 0 10px;
          border-radius: 100px;
          background-color: #d81e05;
        }

        .Invite-Status-Pending {
          margin-left: 5px;
          width: 65px;
          height: 20px;
          display: inline-block;
        }
        .Invite-Status-Pending span {
          width: 45px;
          height: 20px;
          font-size: 12px;
          line-height: 1.67;
          letter-spacing: 0.2px;
          color: #ffffff;
          padding: 0 10px 0 10px;
          border-radius: 100px;
          background-color: #a4b3b8;
        }
        .Invite-Status-Submitted {
          margin-left: 5px;
          width: 77px;
          height: 20px;
          display: inline-block;
        }
        .Invite-Status-Submitted span {
          width: 57px;
          height: 20px;
          font-size: 12px;
          line-height: 1.67;
          letter-spacing: 0.2px;
          color: #2cab70;
          padding: 0 10px 0 10px;
          border-radius: 100px;
          border: solid 1px #2cab70;
        }
        .Invite-Status-Active {
          margin-left: 5px;
          width: 55px;
          height: 20px;
          display: inline-block;
        }
        .Invite-Status-Active span {
          width: 35px;
          height: 20px;
          font-size: 12px;
          line-height: 1.67;
          letter-spacing: 0.2px;
          color: #ffffff;
          padding: 0 10px 0 10px;
          border-radius: 100px;
          background-color: #2cab70;
        }
        .Invite-Status-Disabled {
          margin-left: 5px;
          width: 68px;
          height: 20px;
          display: inline-block;
        }
        .Invite-Status-Disabled span {
          width: 48px;
          height: 20px;
          font-size: 12px;
          line-height: 1.67;
          letter-spacing: 0.2px;
          color: #ffffff;
          padding: 0 10px 0 10px;
          border-radius: 100px;
          background-color: #093649;
        }
        .wizardDescription {
          margin: 0;
          margin-bottom: 30px;
          font-size: 12px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: 1.5;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
        }
        .wizardBoldLabel {
          font-size: 14px;
          font-weight: bold;
          color: #093649;
          margin-top: 20px;
        }
        .wizardBoxTitleContainer {
          width: 540px;
          height: 40px;
          border-radius: 2px;
          background-color: #093649;
        }
        .wizardBoxTitleLabel {
          font-size: 14px;
          font-weight: bold;
          line-height: 1.43;
          letter-spacing: 0.2px;
          color: #ffffff;
          padding-left: 20px;
          padding-top: 9px;
        }
      */}
    })
  ]
});
