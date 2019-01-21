foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx.ui',
  name: 'AscendantFXReportsDownloadView',
  extends: 'foam.u2.View',

  documentation: 'View for downloading AscendantFX Reports',

  imports:[
    'window'
  ],

  exports:[],

  css: `
  ^ {
    width: 992px;
    margin: 0 auto;
  }
  ^ .net-nanopay-ui-ActionView-downloadCsv {
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
  ^ .net-nanopay-ui-ActionView-downloadCsv:hover {
    opacity: 0.9;
  }
  `,

  properties:[],

  methods:[
    function initE(){
      this.SUPER();

      this.addClass(this.myClass())
        .start()
        .start().addClass('light-roboto-h2').add('AscendantFX Reports Download').end()
        .start().add(this.DOWNLOAD_REPORTS).end()
        .end();
    }
  ],

  actions: [
    {
      name: 'downloadReports',
      label: 'Download Reports',
      code: function(X) {
        var self = this;
        var alternaUrl = self.window.location.origin + "/service/alterna";
        self.window.location.assign(alternaUrl);
      }
    }
  ]

});
