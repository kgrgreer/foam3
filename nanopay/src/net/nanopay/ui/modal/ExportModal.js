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
  package: 'net.nanopay.ui.modal',
  name: 'ExportModal',
  extends: 'foam.u2.View',

  documentation: 'Export Modal',

  requires: [
    'net.nanopay.ui.modal.ModalHeader',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.util.Iso20022',
    'net.nanopay.iso20022.ISO20022Driver',
    'foam.nanos.export.JSONDriver',
    'foam.nanos.export.JSONJDriver',
    'foam.nanos.export.XMLDriver',
    'foam.nanos.export.CSVTableExportDriver'
  ],

  properties: [
    {
      name: 'iso20022',
      factory: function() {
        return this.Iso20022.create();
      }
    },
    {
      name: 'iso20022Driver',
      factory: function() {
        return this.ISO20022Driver.create();
      }
    },
    {
      name: 'jsonDriver',
      factory: function() {
        return this.JSONDriver.create();
      }
    },
    {
      name: 'jsonjDriver',
      factory: function() {
        return this.JSONJDriver.create();
      }
    },
    {
      name: 'xmlDriver',
      factory: function() {
        return this.XMLDriver.create();
      }
    },
    {
      name: 'csvDriver',
      factory: function() {
        return this.CSVTableExportDriver.create();
      }
    },
    {
      name: 'dataType',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.exportDriverRegistryDAO,
          objToChoice: function(a) {
            return [a.id, a.id];
          }
        });
      }
    },
    {
      name: 'note',
      view: 'foam.u2.tag.TextArea',
      value: ''
    },
    'exportData',
    'exportObj'
  ],

  css: `
    ^{
      width: 448px;
      margin: auto;
    }
    ^ .foam-u2-tag-Select {
      width: 125px;
      border-radius: 0;
      margin-left: 25px;
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
    ^ .note {
      height: 150px;
      width: 398px;
      margin-left: 25px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();

      this
      .tag(this.ModalHeader.create({
        title: 'Export'
      }))
      .addClass(this.myClass())
        .startContext({ data: this })
          .start()
            .start().addClass('label').add('Data Type').end()
            .start(this.DATA_TYPE).end()
            .start().addClass('label').add('Response').end()
            .start(this.NOTE).addClass('input-box').addClass('note').end()
            .start(this.CONVERT).addClass('blue-button').addClass('btn').end()
          .end()
        .end()
      .end();
    }
  ],

  actions: [
    function convert() {
      var self = this;
      var driver = this.dataType === 'JSON' ?
        this.jsonDriver : this.dataType === 'XML' ?
        this.xmlDriver : this.dataType === 'CSV' ?
        this.csvDriver : this.dataType === 'JSON/J'?
        this.jsonjDriver : null;

      if ( driver === null ) return;

      if ( this.exportData ) {
        driver
          .exportDAO(this.__context__, this.exportData)
          .then(function(result) {
            self.note = result;
          });
      } else {
        this.note = driver.exportFObject(this.__context__, this.exportObj);
      }
    }
  ]
});
