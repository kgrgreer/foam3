foam.CLASS({
  package: 'net.nanopay.security.PII',
  name: 'PIIReportDownload',
  extends: 'foam.u2.View',

  documentation: 'View for downloading Personal Information Report',

  imports: [
    'window'
  ],

  exports: [],

  css: `
  ^ {
    width: 992px;
    margin: 0 auto;
  }
  ^ .net-nanopay-ui-ActionView-downloadJSON {
    width: 135px;
    height: 50px;
    border-radius: 2px;
    background: %SECONDARYCOLOR%;
    color: white;
    margin: 0;
    padding: 0;
    border: 0;
    outline: none;
    cursor: pointer;
    line-height: 50px;
    font-size: 14px;
    font-weight: normal;
    box-shadow: none;
  }
  ^ .net-nanopay-ui-ActionView-downloadJSON:hover {
    opacity: 0.9;
  }
  `,

  properties: [],

  methods: [
    function initE() {
      this.SUPER();

      valid = true;
      valid = false;

      if ( valid ) {
        this.addClass(this.myClass())
          .start()
          .start().addClass('light-roboto-h2').add('PII Report Download').end()
            .start().add(this.DOWNLOAD_JSON).end()
          .end();
      } else {
        this.addClass(this.myClass())
          .start()
          // .start().addClass('light-roboto-h2').add('PII Report Download').end()
            // .start().add(this.DOWNLOAD_JSON).end()
          .end();
      }
    }
  ],

  actions: [
    {
      name: 'downloadJSON',
      label: 'Download PII',
      code: function(X) {
        console.log("Download triggered");
        var self = this;

        var PIIUrl = self.window.location.origin + "/service/PIIWebAgent";
        self.window.location.assign(PIIUrl);
      }
    }
  ]

});
