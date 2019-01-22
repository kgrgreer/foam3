foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx.ui',
  name: 'AscendantFXReportsDownloadView',
  // extends: 'foam.u2.View',
  extends: 'foam.u2.Element',

  documentation: 'View for downloading AscendantFX Reports',

  imports:[
    'window',
    'ascendantFXReportsService'
  ],

  exports: [
    'as data'
  ],

  css: `
  ^ {
    width: 992px;
    margin: 0 auto;
  }
  ^ .net-nanopay-ui-ActionView-downloadReports {
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
  ^ .net-nanopay-ui-ActionView-downloadReports:hover {
    opacity: 0.9;
  }
  `,

  properties:['userId'],

  methods:[
    function initE(){
      this.SUPER();
      console.log(this.userId);
      // console.log(this.data$);
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
        // this.ascendantFXReportsService.downloadReports(this.user.id);
        // var self = this;
        // var alternaUrl = this.window.location.origin + "/service/ascendantFXReports";
        // this.window.location.assign(alternaUrl);
        var alternaUrl = window.location.origin + "/service/ascendantFXReports?userId=567";
        window.location.assign(alternaUrl);
      }
    }
  ]

});
