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
  package: 'net.nanopay.tx.gs',
  name: 'GSFileUploadScreen',
  extends: 'foam.u2.Controller',

  documentation: 'View for downloading Alterna CSV',

  requires: [
    'foam.dao.AbstractDAO',
    'foam.log.LogLevel',
    'foam.nanos.fs.fileDropZone.FileDropZone',
    'net.nanopay.script.CsvUploadScript',
    'net.nanopay.tx.gs.ProgressBarData',
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'notify',
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

  ^container-card {
    border-radius: 6px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
    border: solid 1px #e7eaec;
    background-color: #ffffff;
    padding: 16px;
  }
  
  ^container-card + ^container-card {
    margin-top: 16px;
  }

  ^ .property-pbdBeingReviewedId_ {
    margin-bottom: 24px;
  }

  ^ .foam-nanos-fs-fileDropZone-FileDropZone {
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
    width: 100%;
  }

  ^report {
    white-space: pre-wrap;
    line-height: 1.5;
  }

  ^upload-new-container {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 16px;
  }

  ^upload-new-container > button {
    margin-left: 16px;
  }
  `,

  messages: [
    { name: 'TITLE', message: 'Settlement CSV File Upload' },
    { name: 'OLD_HEADING', message: 'Review Previously Ingested Files' },
    { name: 'IN_PROGRESS_HEADING', message: 'Ingestion In Progress' },
    { name: 'LOADING_MSG', message: 'Loading...' }
  ],

  properties: [
    {
      class: 'String',
      name: 'pbdBeingReviewedId_',
      view: function(args, X) {
        const e = foam.mlang.ExpressionsSingleton.create();
        const ProgressBarData = net.nanopay.tx.gs.ProgressBarData;
        return {
          class: 'foam.u2.view.ChoiceView',
          placeholder: 'Select a previously ingested file...',
          dao: X.ProgressBarDAO.where(e.HAS(ProgressBarData.REPORT)),
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
      name: 'report'
    },
    {
      name: 'currentInterval_',
      documentation: `Keep track of the polling interval so we can stop it.`
    },
    {
      class: 'Boolean',
      name: 'checkingIfInProgress_',
      value: true
    },
    {
      class: 'Boolean',
      name: 'ingestionInProgress_',
      documentation: `
        True if there is an ingestion happening right now. If there is, we don't
        want the user to be able to start a new one. Only one can happen at a
        time.
      `
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.gs.ProgressBarData',
      name: 'pbdInProgress_'
    },
    {
      class: 'String',
      name: 'pbdInProgressId_'
    }
  ],

  methods: [
    function init() {
      this.csvUploadScriptDAO.find('CSVUploadTest').then((script) => {
        this.scriptToUse = script;
        if ( this.csv ) this.scriptToUse.csv = this.csv;
      });
      this.onDetach(this.pbdBeingReviewedId_$.sub(this.loadReport.bind(this)));
      this.updatePollingLoop();
      this.onDetach(this.stopPolling.bind(this));
    },

    function initE() {
      var self = this;

      this.SUPER();
      this.addClass(this.myClass())
        .start('p').addClass(this.myClass('title')).add(this.TITLE).end()
        .start()
          .addClass(this.myClass('container-card'))
          .show(this.checkingIfInProgress_$)
          .add(this.LOADING_MSG)
        .end()
        .start()
          .addClass(this.myClass('container-card'))
          .show(this.slot(function(ingestionInProgress_, checkingIfInProgress_) {
            return ! ingestionInProgress_ && ! checkingIfInProgress_;
          }))
          .tag(self.FileDropZone, {
            files$: self.uploadedCSVs$,
            supportedFormats: { 'csv': 'CSV' },
            isMultipleFiles: false,
            maxSize: 1024
          })
          .startContext({ data: self }).tag(self.PROCESS).endContext()
        .end()
        .start()
          .addClass(this.myClass('container-card'))
          .show(this.slot(function(ingestionInProgress_, checkingIfInProgress_) {
            return ingestionInProgress_ && ! checkingIfInProgress_;
          }))
          .start('h2').add(this.IN_PROGRESS_HEADING).end()
          .start('p').add(self.pbdInProgress_$.map((pbd) => pbd ? pbd.name : '')).end()
          .start('p').add(self.pbdInProgress_$.map((pbd) => pbd ? pbd.status : '')).end()
          .start()
            .addClass('progress-bar')
            .start()
              .addClass('back')
              .start()
                .addClass('front')
                .style({ width: self.pbdInProgress_$.map((pbd) => pbd ? pbd.state + '%' : '0%') })
              .end()
            .end()
          .end()
        .end()
        .start()
          .addClass(this.myClass('container-card'))
          .start('h2').add(this.OLD_HEADING).end()
          .add(this.PBD_BEING_REVIEWED_ID_)
          .add(this.slot(function(report) {
            if ( ! report ) return this.E();

            return self.E()
              .start('p').addClass(self.myClass('report')).add(report).end()
          }))
        .end();
    },

    function poll() {
      /**
       * Ask the server for an update on the currently selected file ingestion.
       * This has to handle two cases:
       *   1. We don't know if there's a file ingestion in progress or not,
       *   2. We just started a file ingestion and want to track it
       */
      this.ProgressBarDAO.find(
        this.OR(
          this.EQ(this.ProgressBarData.ID, this.pbdInProgressId_),
          this.NOT(this.HAS(this.ProgressBarData.REPORT))
        )
      )
        .then((pbd) => {
          if ( pbd == null ) return; // Keep polling.

          if ( pbd.report ) {
            // We're finished ingesting the one we started.

            // Force the dropdown of previously ingested files to update so that
            // it includes the one that just finished.
            this.ProgressBarDAO.cmd(this.AbstractDAO.RESET_CMD);
            if ( pbd.statusPass === true ) this.notify(pbd.status, '', this.LogLevel.INFO, true);
            else this.notify(pbd.status, '', this.LogLevel.ERROR, true);
            this.ingestionInProgress_ = false;
            this.pbdBeingReviewedId_ = this.pbdInProgressId_;
            this.pbdInProgress_ = null;
            this.pbdInProgressId_ = '';
            this.uploadedCSVs = [];
            return;
          }

          if ( ! this.ingestionInProgress_ ) this.ingestionInProgress_ = true;
          this.pbdInProgress_ = pbd;
          this.pbdInProgressId_ = pbd.id;
        })
        .catch(this.stopPolling.bind(this))
        .finally(() => this.checkingIfInProgress_ = false);
    },

    function loadReport() {
      /**
       * Load the report for a previously ingested file.
       */
      this.ProgressBarDAO.find(this.pbdBeingReviewedId_).then((pbd) => {
        this.report = pbd ? pbd.report : '';
      });
    },

    function stopPolling() {
      /**
       * Cleanup method.
       */
      if ( this.currentInterval_ ) clearInterval(this.currentInterval_);
      this.currentInterval_ = null;
    }
  ],

  listeners: [
    function updatePollingLoop() {
      /**
       * There's an ingestion in progress and we want to start polling the
       * server to track it.
       */
      this.stopPolling();
      this.checkingIfInProgress_ = true;
      this.currentInterval_ = setInterval(this.poll.bind(this), 1000);
    }
  ],

  actions: [
    {
      name: 'process',
      label: 'Begin Ingestion',
      isEnabled: (uploadedCSVs) => uploadedCSVs.length > 0,
      code: function() {
        this.ingestionInProgress_ = true;
        if ( this.scriptToUse && this.csv ) {
          this.pbdInProgressId_ = this.scriptToUse.progressId = foam.uuid.randomGUID();
          this.pbdInProgress_ = this.ProgressBarData.create({ status: this.LOADING_MSG });
          this.scriptToUse.filename = this.uploadedCSVs[0].filename;
          this.scriptToUse.name = this.scriptToUse.run();
        }
        this.updatePollingLoop();
      }
    }
  ]
});
