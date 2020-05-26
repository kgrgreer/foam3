foam.CLASS({
    package: 'net.nanopay.ui',
    name: 'NanoConnectStyles',
    extends: 'foam.u2.View',

    documentation: 'CSS that is used for NanoConnect',

    css: `
      .generic-status-circle {
          display: none;
      }
      
      .Pending {
        background-color: transparent;
      }
      
      .Invoice-Status-Scheduled {
        color: #2cab70 !important;
        border: 1px solid #2cab70;
        background: white;
        font-size: 10px;
        border-radius: 30px;
        padding: 3px 7px;
        display: inline;
      }

      .Invoice-Status-Funds-in-transit {
        color: #000000 !important;
        background: #e49339;
      }

      .Invoice-Status-Processing {
        color: #000000 !important;
      }

      .Invoice-Status-Completed {
        background: #2cab70;
      }

      .net-nanopay-ui-wizard-WizardController input {
        border: solid 1px #8e9090;
        border-radius: 3px;
        padding: 12px;
        font-size: 14px;
        font-family: 'Lato', sans-serif;
      }

    `
  });
