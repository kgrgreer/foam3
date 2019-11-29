foam.CLASS({
  package: 'net.nanopay.tx.gs',
  name: 'GSFileUploadScreen',
  extends: 'foam.u2.View',

  documentation: 'View for downloading Alterna CSV',

  requires: [
    'net.nanopay.script.CsvUploadScript',
    'net.nanopay.sme.ui.fileDropZone.FileDropZone',
    'net.nanopay.tx.gs.ProgressBarData',
  ],

  imports:[
    'window',
    'csvUploadScriptDAO',
    'ProgressBarDAO'
  ],

  css: `

    ^ .progress-bar {
      position: relative;
      padding-left: 20px;
      padding-top: 20px;
      height: 30px;
      width: 50%;
      overflow: hidden;
      border-radius: 6px;
    }
    ^ .back {
      background-color: #E6E6E6;
      height: 30px;
      top: 0;
      position: absolute;
      width: 100%;
      border-radius: 6px;
    }
    ^ .front {
      background-color: #03CF1F;
      position: absolute;
      top: 0;
      left: 0;
      height: 30px;
      border-radius: 6px;
    }
    ^ .button {
      padding-left: 20px;
      padding-top: 5px;
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
    ^ .foam-u2-ActionView-process:hover {
      opacity: 0.9;
    }

  `,

  properties:[
    {
      class: 'String',
      name: 'id_',
      hidden: true
    },
    {
      class: 'Long',
      name: 'c'
    },
    {
      name: 'scriptToUse',
      class: 'net.nanopay.script.CsvUploadScript'
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
      //view: { class: 'foam.nanos.pm.TemperatureCView' },
      expression: function(id_,c){
          return this.ProgressBarDAO.find(id_).then( function(data) {
          if ( data != null )
            return data.state+'%';
          return '0%';

          });
        }
      //value: '50%'
    },
        {
          class: 'String',
          name: 'progressBarStatus',
          //view: { class: 'foam.nanos.pm.TemperatureCView' },
          expression: function(id_,c){
              return this.ProgressBarDAO.find(id_).then((data) => {
              if ( data != null )
                return data.status;
              return 'Awaiting File Upload.';
              });
            }
          //value: 'Ingested: 300000 of 600000'
        }
  ],

  methods:[
  function init() {
    this.csvUploadScriptDAO.find('CSVUploadTest').then((script) => {
      this.scriptToUse = script;
      if ( this.csv ) this.scriptToUse.csv = this.csv;
    })
  },
    function initE(){

      var self = this;
      var timeout = setInterval
      (() => {this.c++},1000);

      this.onDetach(function() {
      this.clearInterval(timeout);
      }.bind(this));

      this.SUPER();
      this.addClass(this.myClass())
      .start().addClass('light-roboto-h2').addClass('button').add('Settlement CSV File Upload').end()
      .start( this.FileDropZone, {
        files$: this.uploadedCSVs$,
        supportedFormats: { 'csv': 'CSV' },
        isMultipleFiles: false,
        maxSize: 1024
      }).end()

        .startContext({data: this})
          .start().addClass('button')
            .start().add(this.PROCESS).end()
          .end()

        .endContext()


      .add(self.slot(function(progressBarValue, progressBarStatus) {
        return self.E()

        .start()
         .start().addClass('light-roboto-h2').add(progressBarStatus).addClass('button').end()
          .start()
            .addClass('progress-bar')
            .start()
              .addClass('back')
            .start()
              .addClass('front')
              .style({
                width: progressBarValue
              })
               .end()
            .end()
          .end()
        .end()

      }))
    }
  ],

  actions: [
    {
      name: 'process',
      code: function() {
        if (this.scriptToUse && this.csv){
          this.scriptToUse.progressId = foam.uuid.randomGUID();
          this.id_ = this.scriptToUse.progressId;
          console.log(this.id_+ " :lol look: "+ this.scriptToUse.progressId);
          this.scriptToUse.run();
        }
      }
    },
  ]

});
