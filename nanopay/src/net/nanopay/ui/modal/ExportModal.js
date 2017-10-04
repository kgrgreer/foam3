
foam.CLASS({
  package: 'net.nanopay.ui.modal',
  name: 'ExportModal',
  extends: 'foam.u2.View',

  documentation: 'Export Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.interac.Iso20022',
    'net.nanopay.iso20022.ISO20022Driver',
    'foam.nanos.export.JSONDriver',
    'foam.nanos.export.XMLDriver'
  ],

  properties: [
    {
      name: 'iso20022',
      factory: function () {
        return this.Iso20022.create();
      }
    },
    {
      name: 'iso20022Driver',
      factory: function () {
        return this.ISO20022Driver.create();
      }
    },
    {
      name: 'jsonDriver',
      factory: function (){
        return this.JSONDriver.create();
      }
    },
    {
      name: 'xmlDriver',
      factory: function () {
        return this.XMLDriver.create();
      }
    },
    {
      name: 'dataType',
      view: {
        class: 'foam.u2.view.ChoiceView',
        choices: [
          'XML',
          'JSON',
          'PACS 008'
        ],
      },
      value: 'JSON'
    },
    {
      name: 'note',
      view: 'foam.u2.tag.TextArea',
      value: ''
    },
    'exportData'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*

      ^{
        width: 448px;
        margin: auto;
      }
      ^ .foam-u2-tag-Select {
        width: 125px;
        height: 40px;
        border-radius: 0;
        margin-left: 20px;
        padding: 12px 20px;
        border: solid 1px rgba(164, 179, 184, 0.5);
        background-color: white;
        outline: none;
      }
      ^ .foam-u2-tag-Select:hover {
        cursor: pointer;
      }
      ^ .foam-u2-tag-Select:focus {
        border: solid 1px #59A5D5;
      }
      ^ .label{
        margin-top: 10px;
      }
    */}
    })
  ],
  
  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this
      .tag(this.ModalHeader.create({
        title: 'Export'
      }))
      .addClass(this.myClass())
        .startContext({ data: this})
          .start()
            .start().addClass('label').add("Data Type").end()
            .start(this.DATA_TYPE).end()
            .start().addClass('label').add("Response").end()
            .start(this.NOTE).addClass('input-box').end()
            .start(this.CONVERT_INVOICE).addClass('blue-button btn').end()
          .end()
        .end()
      .end()
    } 
  ],

  actions: [
    function convertInvoice(){
      var self = this;

      if (this.dataType == 'JSON'){
        this.note = this.jsonDriver.exportFObject(null, this.exportData);
      } else if (this.dataType == 'XML') {
        this.note = this.xmlDriver.exportFObject(null, this.exportData);
      } else if (this.dataType == 'PACS 008') {
        this.iso20022.GENERATE_PACS008_MESSAGE(this.exportData).then(function (message) {
          self.note = self.iso20022Driver.exportFObject(null, message)
        })
      }
    }
  ]
})