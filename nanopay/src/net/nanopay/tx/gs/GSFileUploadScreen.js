foam.CLASS({
  package: 'net.nanopay.tx.gs',
  name: 'GSFileUploadScreen',
  extends: 'foam.u2.Controller',

  documentation: 'View for downloading Alterna CSV',

  requires: [
    'net.nanopay.script.CsvUploadScript',
    'net.nanopay.sme.ui.fileDropZone.FileDropZone',
    'net.nanopay.tx.gs.ProgressBarData',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'window',
    'csvUploadScriptDAO',
    'ProgressBarDAO'
  ],

  css: `
  ^ {
    padding: 32px;
  }

  ^title {
    margin-top: 0;
    font-size: 36px;
    font-weight: 600;
    line-height: 1.33;
    color: #1e1f21;
  }

  ^heading {
    margin: 0;
    margin-bottom: 8px;
    font-size: 28px;
    font-weight: 600;
    line-height: 1.33;
    color: #1e1f21;
  }

  ^instructions {
    margin-bottom: 8px;
  }

  ^container-card {
    border-radius: 6px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
    border: solid 1px #e7eaec;
    background-color: #ffffff;
    padding: 16px;
  }

  ^ .property-id_ {
    margin-bottom: 24px;
  }

  ^ .net-nanopay-sme-ui-fileDropZone-FileDropZone {
    margin-bottom: 24px;
  }

  ^ .progress-bar {
    position: relative;
    width: 50%;
    border-radius: 6px;
  }

  ^ .back {
    background-color: #E6E6E6;
    height: 30px;
    top: 0;
    width: 100%;
    border-radius: 6px;
  }

  ^ .front {
    background-color: #03CF1F;
    top: 0;
    left: 0;
    height: 30px;
    border-radius: 6px;
  }

  ^ .foam-u2-ActionView-process {
    width: 135px;
    height: 50px;
    border-radius: 2px;
    background: /*%PRIMARY3%*/ #406dea;
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

  ^ .foam-u2-ActionView-back {
    margin-top: 16px;
  }

  ^ .foam-u2-ActionView-process {
    width: 100%;
  }

  ^ .foam-u2-ActionView-process:hover {
    opacity: 0.9;
  }

  ^report {
    white-space: pre-wrap;
    line-height: 1.5;
  }

  `,

  messages: [
    { name: 'TITLE', message: 'Settlement CSV File Upload' },
    { name: 'LABEL_CHOOSE', message: 'Choose a current or previously ingested instance:' },
    { name: 'LABEL_SELECTOR', message: '< New Ingestion >' },
    { name: 'LABEL_REPORT', message: 'Ingestion Report' }
  ],

  properties: [
    {
      class: 'String',
      name: 'id_',
      view: function(args, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          placeholder: X.data.LABEL_SELECTOR,
          dao: X.ProgressBarDAO.where(X.data.NOT(X.data.INSTANCE_OF(net.nanopay.tx.gs.IngestionReport))),
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        };
      },
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.script.CsvUploadScript',
      name: 'scriptToUse',
    },
    {
      name: 'csv'
    },
    {
      name: 'uploadedCSVs',
      postSet: function(_, n) {
        if ( n.length <= 0 ) return;
        this.csv = n[0];
        this.scriptToUse.csv = n[0];
      }
    },
    {
      class: 'String',
      name: 'progressBarValue',
      value: '0%'
    },
    {
      class: 'String',
      name: 'progressBarStatus',
      value: 'Awaiting File Upload.'
    },
    {
      class: 'String',
      name: 'report'
    }
  ],

  methods: [
    function init() {
      this.csvUploadScriptDAO.find('CSVUploadTest').then((script) => {
        this.scriptToUse = script;
        if ( this.csv ) this.scriptToUse.csv = this.csv;
      });
    },

    function initE() {
      var self = this;

      var timeout = setInterval(() => {
        this.ProgressBarDAO.find(this.id_).then((data) => {
          if ( data != null ) {
            this.progressBarStatus = data.status;
            this.progressBarValue = data.state + '%';
          }
          else {
            this.progressBarStatus = 'Awaiting File Upload.';
            this.progressBarValue = '0%';
          }
        });
        this.ProgressBarDAO.find(this.id_ + 'report').then((data) => {
          if ( data != null ) {
            this.report = data.report;
          } else {
            this.report = '';
          }
        });
      }, 1000);

      this.onDetach(function() {
        clearInterval(timeout);
      }.bind(this));

      this.SUPER();
      this.addClass(this.myClass())
        .start('p').addClass(this.myClass('title')).add(this.TITLE).end()
        .start().addClass(this.myClass('container-card'))
          .start('p').addClass(this.myClass('instructions')).add(this.LABEL_CHOOSE).end()
          .add(this.ID_)
          .add(this.slot(function(report) {
            if ( ! report ) {
              return self.E().start(self.FileDropZone, {
                files$: self.uploadedCSVs$,
                supportedFormats: { 'csv': 'CSV' },
                isMultipleFiles: false,
                maxSize: 1024
              }).end()
              .add(self.slot(function(uploadedCSVs, progressBarStatus) {
                if ( uploadedCSVs.length === 0 || ! progressBarStatus.includes('Awaiting File Upload.') ) return self.E();
                return self.E()
                  .startContext({ data: self })
                    .add(self.PROCESS)
                  .endContext();
              }))
              .add(self.slot(function(progressBarStatus) {
                return progressBarStatus.includes('Awaiting File Upload.') ? self.E() :
                  self.E().start('p').add(self.progressBarStatus$).end()
                    .start().addClass('progress-bar')
                      .start().addClass('back')
                        .start().addClass('front').style({ width: self.progressBarValue$ })
                        .end()
                      .end()
                    .end();
              }));
            } else {
              return self.E()
                .start('p').addClass(self.myClass('heading')).add(self.LABEL_REPORT).end()
                .start().addClass(this.myClass('container-card'))
                  .start('p').addClass(self.myClass('report')).add(report).end()
                .end();
            }
          }))
          .add(this.slot(function(id_, report) {
            if ( id_ != self.LABEL_SELECTOR && report != '' ) {
              return self.E()
                .startContext({ data: self })
                  .add(self.BACK)
                .endContext();
            }
          }))
        .end();
    }
  ],

  actions: [
    {
      name: 'process',
      label: 'Begin Ingestion',
      isEnabled: function(uploadedCSVs, progressBarStatus) {
        if ( uploadedCSVs.length === 0 || ! progressBarStatus.includes('Awaiting File Upload.') ) return false;
        return uploadedCSVs.length > 0;
      },
      code: function() {
        if ( this.scriptToUse && this.csv ) {
          this.scriptToUse.progressId = foam.uuid.randomGUID();
          this.scriptToUse.filename = this.uploadedCSVs[0].filename;
          this.id_ = this.scriptToUse.progressId;
          this.scriptToUse.name = this.scriptToUse.run();
        }
      }
    },
    {
      name: 'back',
      label: 'Upload a New File',
      code: function() {
        this.report = '';
        this.id_ = this.LABEL_SELECTOR;
        this.progressBarStatus = 'Awaiting File Upload.';
      }
    }
  ]
});
