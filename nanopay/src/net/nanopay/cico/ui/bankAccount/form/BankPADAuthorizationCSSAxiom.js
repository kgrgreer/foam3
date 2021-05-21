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
  package: 'net.nanopay.cico.ui.bankAccount.form',
  name: 'BankPADAuthorizationCSSAxiom',
  extends: 'foam.u2.CSS',
  properties: [
    {
      name: 'code',
      value: `
        ^ {
          height: 100%;
        }

        ^ input {
          background-color: white;
        }

        ^ .col {
          display: inline-block;
          width: 357px;
          vertical-align: top;
        }

        ^ .colSpacer {
          margin-left: 30px;
        }

        ^ input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        ^ .foam-u2-tag-Select {
          width: 100%;
          border-radius: 0;

          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;

          padding: 0 15px;
          border: solid 1px rgba(164, 179, 184, 0.5);
          background-color: white;
          outline: none;
        }

        ^ .institutionContainer {
          position: relative;
        }

        ^ .foam-u2-tag-Select:hover {
          cursor: pointer;
        }

        ^ .foam-u2-tag-Select:focus {
          border: solid 1px #59A5D5;
        }

        ^ .foam-u2-TextField {
          outline: none;
          height: 40px;
          padding: 10px;
        }

        ^ .instituteOtherMargin {
          margin-left: 150px;
        }

        ^ .headings {
          font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 14px;
          font-weight: bold;
          font-style: normal;
          font-stretch: normal;
          line-height: normal;
          letter-spacing: 0.2px;
          text-align: left;
          color: /*%BLACK%*/ #1e1f21;
          padding-bottom: 6px;
          margin: 14px 0px ;

        }

        ^ .messageBody {
          font-size: 12px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: 1.5;
          letter-spacing: 0.3px;
          text-align: left;
          color: /*%BLACK%*/ #1e1f21;
          margin-top:0px
        }
        ^ .full-width-input{
          width: 498px;
          left: -26px;
          position: relative;
          font-size: 14px;
          margin-top: 8px;
        }
        ^ .inputLarge{
          margin-bottom: 20px;
          font-size: 14px;
          margin-top: 10px;
        }
        ^ .full-width-input-label{
          width: 474px;
          height: 17px;
          position: relative;
          font-size: 14px;
          margin: 8px 0px 20px 0px;
        }
        ^ .inputLarge-label{
          height: 17px;
          margin-bottom: 20px;
          font-size: 14px;
          margin-top: 10px;
          width: 196px
        }
        ^ .regionContainer {
          position: relative;
          margin-bottom: 20px;
        }
        ^ .countryContainer {
          position: relative;
          margin-bottom: 20px;
        }
        ^ .caret {
          position: relative;
        }
        ^ .caret:before {
          content: '';
          position: absolute;
          top: -42px;
          left: 190px;
          border-top: 7px solid #a4b3b8;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
        }
        ^ .caret:after {
          content: '';
          position: absolute;
          left: 12px;
          top: 0;
          border-top: 0px solid #ffffff;
          border-left: 0px solid transparent;
          border-right: 0px solid transparent;
        }
        ^ .longcaret {
          position: relative;
        }
        ^ .longcaret:before {
          content: '';
          position: absolute;
          top: -32px;
          left: 472px;
          border-top: 7px solid #a4b3b8;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
        }
        ^ .longcaret:after {
          content: '';
          position: absolute;
          left: 12px;
          top: 0;
          border-top: 0px solid #ffffff;
          border-left: 0px solid transparent;
          border-right: 0px solid transparent;
        }
        ^ .property-region{
          padding: 10px 0px;
          width: 218px;
        }
        ^ .property-country{
          padding: 10px 0px;
          width: 497px;
        }
        ^ .infoContainer-wizard{
          width: 496px;
          background: white;
          border-radius: 2px;
          overflow-y: auto;
          padding: 20px;
        }
        ^ .notEditable{
          font-size: 12px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: 1.17;
          letter-spacing: 0.2px;
          background-color: #ffffff;
          color: #a4b3b8;
          border: solid 1px rgba(164, 179, 184, 0.5);
          padding: 10px;
        }
        ^ .header{
          padding-bottom: 10px;
          font-size: 12px;
          font-weight: normal;
          font-style: normal;
          font-stretch: normal;
          line-height: 1.17;
          letter-spacing: 0.2px;
          background-color: #ffffff;
        }
        ^ .link{
          color: #59a5d5;
        }
        ^ .pDefault{
          margin-bottom: 14 !important;
        }

        ^ .address2Hint {
          height: 14px;
          font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          line-height: 1.17;
          letter-spacing: 0.2px;
          text-align: left;
          color: /*%BLACK%*/ #1e1f21;
          margin-top: -15px;
          margin-bottom: 15px;
        }
      `,
    },
  ],
});
