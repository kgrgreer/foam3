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
  package: 'net.nanopay.ui.wizard',
  name: 'WizardCssAxiom',
  extends: 'foam.u2.CSS',
  properties: [
    {
      name: 'code',
      value: `
        ^{
          background-color: /*%GREY5%*/ #f5f7fa;
          height: calc(100% - 20px - 60px - 60px);
          margin: auto;
          padding-top: 30px;
          box-sizing: border-box;
        }

        ^ .title {
          font-size: 20px;
          margin: 0;
          line-height: 40px;
          margin-bottom: 30px;
          display: inline-block;
        }

        ^ .subTitle {
          margin: 0;
          line-height: 40px;
          display: inline-block;
          font-size: 30px;
          font-weight: bold;
          font-style: normal;
          font-stretch: normal;
          color: /*%BLACK%*/ #1e1f21;

          margin-bottom: 30px;
        }

        ^ .positionColumn {
          display: inline-block;
          width: 300px;
          vertical-align: top;
          box-sizing: border-box;
          padding: 20px;
          padding-left: 0;
          padding-top: 0;
        }

        ^ .stackColumn {
          display: inline-block;
          width: calc(100% - 300px);
          height: calc(100% - 65px);
          box-sizing: border-box;
          padding: 20px 0;
          padding-top: 4px;
          overflow-y: auto;
          vertical-align: top;
        }

        ^ .navigationBar {
          position: fixed;
          width: 100%;
          height: 60px;
          left: 0;
          bottom: 0;
          background-color: white;
          z-index: 100;
        }

        ^ .navigationContainer {
          display: flex;
          justify-content: space-between;
          margin: 0 auto;
          width: 1000px;
          padding: 10px 0;
        }

        ^ .navigationContainer > div {
          display: flex;
        }

        ^ .navigationContainer > div > * + * {
          margin-left: 8px;
        }

        ^ .foam-u2-ActionView-unavailable {
          width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        ^ .wizardBody {
          width: 1000px;
          height: calc(100% - 65px);
          margin: auto;
        }
      `,
    },
  ],
});
