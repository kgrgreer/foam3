/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.ui.style',
  name: 'AppStyles',
  extends: 'foam.u2.View',

  documentation: 'Generic CSS that is used through out' +
      ' the Nanopay platform. Please Reference when' +
      ' styling views. Implements to class use.',

  css: `
    body {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      letter-spacing: 0.2px;
      color: #373a3c;
      background: /*%GREY5%*/ #f5f7fa;
      margin: 0;
    }
    h1{
      font-style: normal;
      font-weight: 700;
      font-size: 35px;
      line-height: 40px;
      margin: 0;
    }
    h2{
      font-style: normal;
      font-weight: 600;
      font-size: 29px;
      line-height: 32px;
      margin: 0;
    }
    h3{
      font-style: normal;
      font-weight: 600;
      font-size: 24px;
      line-height: 28px;
      margin: 0;
    }
    h4{
      font-style: normal;
      font-weight: 600;
      font-size: 20px;
      line-height: 24px;
      margin: 0;
    }
    h5{
      font-style: normal;
      font-weight: 600;
      font-size: 16px;
      line-height: 20px;
      margin: 0;
    }
    h6{
      font-style: normal;
      font-weight: 600;
      font-size: 14px;
      line-height: 18px;
      margin: 0;
    }
    p {
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      line-height: 24px;
      margin: 0;
    }
    p.large {
      font-size: 18px;
      line-height: 32px;
      margin: 0;
    }
    p.semiBold{
      font-style: normal;
      font-weight: 600;
      margin: 0;
    }
    p.bold{
      font-style: normal;
      font-weight: 700;
    }
    p.legalText{
      font-style: normal;
      font-weight: normal;
      font-size: 11px;
      line-height: 14px;
    }
    p.label{
      font-style: normal;
      font-weight: 500;
      font-size: 11px;
      line-height: 14px;
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
      padding: 8px;
    }
    .foam-u2-ActionView{
      border: none;
      outline: none;
    }
    .foam-u2-search-TextSearchView input {
      background-image: url("images/ic-search.svg");
      background-repeat: no-repeat;
      background-position: 8px;
      border-radius: 2px;
      border: 1px solid #dce0e7;
      color: /*%BLACK%*/ #1e1f21;
      font-size: 14px;
      height: 40px;
      padding: 0 21px 0 38px;
    }
    .foam-u2-search-GroupBySearchView select {
      font-family: monospace;
      font-size: 9pt;
    }
    .foam-u2-ActionView {
      padding: 4px 16px;
      text-decoration: none;
    }
    .foam-u2-ActionView-backAction {
      border: 1px solid lightgrey;
      // background-color: rgba(164, 179, 184, 0.1);
      vertical-align: top;
      position: relative;
      z-index: 10;
    }
    .foam-u2-ActionView-deleteDraft {
      // background-color: rgba(164, 179, 184, 0.1);
      border: solid 1px #8C92AC;
      color: /*%BLACK%*/ #1e1f21;
      font-size: 14px;
    }
    .foam-u2-ActionView-saveAndPreview {
      background-color: /*%PRIMARY3%*/ #406dea;
      color: white;
      font-size: 14px;
      float: right;
    }
    .foam-u2-ActionView-saveAndPreview:hover {
      opacity: 0.9;
    }
    .foam-u2-ActionView-saveAsDraft {
      background-color: #EDF0F5;
      border: solid 1px /*%PRIMARY3%*/ #406dea;
      color: /*%PRIMARY3%*/ #406dea;
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
      color: /*%BLACK%*/ #1e1f21;
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
      background-color: /*%PRIMARY3%*/ #406dea;
      color: #ffffff;
      margin: 20px 20px;
      float: right;
    }
    .blue-button:hover {
      background: /*%PRIMARY2%*/ #144794;
    }
    .grey-button{
      background-color: rgba(164, 179, 184, 0.1);
      border: solid 1px #8C92AC;
      color: /*%BLACK%*/ #1e1f21;
    }
    .white-blue-button{
      border: solid 1px /*%PRIMARY3%*/ #406dea;
      color: /*%PRIMARY3%*/ #406dea;
      background: none;
    }
    .full-width-button{
      width: 90%;
      height: 40px;
      border-radius: 2px;
      border: solid 1px /*%PRIMARY3%*/ #406dea;
      margin: 0 auto;
      background-color: /*%PRIMARY3%*/ #406dea;
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
    .link{
      color: /*%PRIMARY3%*/ #406dea;
      cursor: pointer;
    }
    .light-roboto-h2 {
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      color: /*%BLACK%*/ #1e1f21;
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
      border: 3px solid /*%PRIMARY3%*/ #406dea;
      display: block;
      width: 135px;
      height: 70px;
      padding-top: 30px;
      border-radius: 2px;
      background-color: /*%PRIMARY3%*/ #406dea;
      text-align: center;
      color: white;
      font-weight: 16px;
      display: inline-block;
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
    .foam-u2-tag-Select:focus {
      outline: none;
      border: 1px solid /*%PRIMARY3%*/ #406dea;
    }
    .foam-u2-TextField:focus {
      outline: none;
      border: 1px solid /*%PRIMARY3%*/ #406dea;
    }
    .foam-u2-tag-TextArea:focus {
      outline: none;
      border: 1px solid /*%PRIMARY3%*/ #406dea;
    }
    .foam-u2-CurrencyView:focus {
      outline: none;
      border: 1px solid /*%PRIMARY3%*/ #406dea;
    }
    .foam-u2-DateView:focus {
      outline: none;
      border: 1px solid /*%PRIMARY3%*/ #406dea;
    }
    .foam-u2-ActionView-backAction:hover {
      background: rgba(164, 179, 184, 0.3);
    }
    .foam-u2-ActionView-deleteDraft:hover {
      background: rgba(164, 179, 184, 0.3);
    }
    .foam-u2-dialog-Popup.popup-with-topnav {
      margin-top: 65px;
      z-index: 10000;
    }
    .filter-search:focus {
      outline: none;
      border: 1px solid /*%PRIMARY3%*/ #406dea !important;
    }
    .foam-u2-ActionView-signUp{
      position: relative;
      width: 100% !important;
      height: 40px;
      background: none;
      background-color: /*%PRIMARY3%*/ #406dea;
      font-size: 14px;
      border: none;
      color: white;
      border-radius: 2px;
      outline: none;
      cursor: pointer;
      filter: grayscale(0%);
    }
    .foam-u2-ActionView-signUp:hover{
      background: none;
      background-color: /*%PRIMARY3%*/ #406dea;
    }
    .foam-u2-ActionView-saveAndPreview:hover {
      background: /*%PRIMARY2%*/ #144794;
    }
    .foam-u2-ActionView-close{
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
    .foam-u2-ActionView-close{
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
      color: /*%BLACK%*/ #1e1f21;
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
      overflow-y: auto;
      padding: 20px;
    }
    .bottomMargin {
      margin-bottom: 20px;
    }
    .boxTitle {
      opacity: 0.6;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 20px;
      font-weight: 300;
      line-height: 20px;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
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
      background-color: /*%PRIMARY3%*/ #406dea;
      display: inline-block;
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
      display: inline-block;
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
      display: inline-block;
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
      display: inline-block;
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
      display: inline-block;
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
      display: inline-block;
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
      background-color: /*%BLACK%*/ #1e1f21;
      display: inline-block;
    }
    .wizardDescription {
      margin: 0;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    .wizardBoldLabel {
      font-size: 14px;
      font-weight: bold;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 20px;
    }
    .wizardBoxTitleContainer {
      width: 540px;
      height: 40px;
      border-radius: 2px;
      background-color: /*%BLACK%*/ #1e1f21;
      margin-top: 30px;
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
    .foam-doc-DocBrowser {
      width: 100%;
      overflow: auto;
      padding: 20px 0px 0px 20px;
    }
    .foam-doc-DocBorder-content {
      height: 80vh !important;
      overflow: auto;
    }
    .foam-doc-DocBorder-content .foam-u2-DetailView {
      width: 200px;
      overflow: auto;
    }
    .foam-doc-ClassList {
      display: inline-block;
    }
    .foam-u2-view-TableView th:hover {
      cursor: pointer;
    }
    .foam-support-view-TicketView .foam-u2-ListCreateController .foam-u2-ActionView-create {
      position: relative;
      top: -32;
      margin-right: 5px;
    }
    .foam-u2-ActionView-submitAs {
      background-color: /*%PRIMARY3%*/ #406dea;
      border: solid 1px /*%PRIMARY3%*/ #406dea;
      color: white;
      float: right;
      margin-right: 1px;
      position: sticky;
      z-index: 10;
    }
    button.foam-u2-ActionView-submitAsDropDown {
      width: 30px;
      height: 40px;
      background-color: /*%PRIMARY3%*/ #406dea;
      border: solid 1px /*%PRIMARY3%*/ #406dea;
      float: right;
    }
    button.foam-u2-ActionView-submitAsDropDown::after {
      content: ' ';
      position: absolute;
      height: 0;
      width: 0;
      border: 6px solid transparent;
      border-top-color: white;
      transform: translate(-6.5px, -1px);
    }
    .foam-u2-ActionView-followUp {
      background-color: /*%PRIMARY3%*/ #406dea;
      border: solid 1px /*%PRIMARY3%*/ #406dea;
      color: white;
    }
  `
});
