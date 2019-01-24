foam.CLASS({
  package: 'net.nanopay.ui.wizard',
  name: 'WizardCssAxiom',
  extends: 'foam.u2.CSS',
  properties: [
    {
      name: 'code',
      value: `
        ^{
          background-color: #edf0f5;
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
          color: #093649;

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
          overflow-y: scroll;
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
          margin: 0 auto;
          width: 1000px;
          padding: 10px 0;
        }

        ^ .exitContainer {
          float: left;
        }

        ^ .inlineDisplay {
          display: inline-block;
        }

        ^ .backNextContainer {
          float: right;
        }

        ^ .net-nanopay-ui-ActionView-unavailable {
          width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        ^ .plainAction {
          display: inline-block;
          margin: 0;
          box-sizing: border-box;
          margin-right: 10px;
          background: none;
          outline: none;
          border:none;
          width: 136px;
          height: 40px;
          border-radius: 2px;
          box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
          // background-color: rgba(164, 179, 184, 0.1);
          font-size: 12px;
          font-weight: lighter;
          letter-spacing: 0.2px;
          color: #093649;
        }

        ^ .plainAction:last-child {
          margin-right: 10px;
        }

        ^ .plainAction:disabled {
          background-color: #c2c9ce;
          opacity: 0.5;
          color: white;
        }

        ^ .plainAction:hover:enabled {
          cursor: pointer;
          background: none;
          background-color: rgba(164, 179, 184, 0.4);
        }

        ^ .net-nanopay-ui-ActionView-goNext {
          display: inline-block;
          margin: 0;
          background: none;
          outline: none;
          border:none;
          min-width: 136px;
          height: 40px;
          border-radius: 2px;
          background-color: %SECONDARYCOLOR%;
          font-size: 12px;
          font-weight: lighter;
          letter-spacing: 0.2px;
          color: #FFFFFF;
        }

        ^ .net-nanopay-ui-ActionView-goNext:disabled {
          color: white;
          background-color: #c2c9ce;
        }

        ^ .net-nanopay-ui-ActionView-goNext:hover:enabled {
          cursor: pointer;
          background: none;
          background-color: #3783b3;
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
