/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'ExportModal',
  extends: 'foam.u2.View',

  documentation: 'Export Modal',

  imports: [
    'exportDriverRegistryDAO',
    'filteredTableColumns',
    'serviceName'
  ],

  requires: [
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows'
  ],

  css: `
    ^{
      width: 448px;
      margin: auto;
    }
    ^ > *, ^ .foam-u2-layout-Grid {
      gap: 12px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'dataType',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.exportDriverRegistryDAO.where(X.data.predicate),
          objToChoice: function(a) {
            return [a.id, a.id];
          },
          placeholder: 'Select'
        }, X);
      }
    },
    {
      name: 'isDataTypeSelected',
      expression: function(dataType) {
        return dataType != '';
      }
    },
    {
      name: 'note',
      label: 'Response',
      view: 'foam.u2.tag.TextArea',
      value: ''
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.predicate.Predicate',
      name: 'predicate',
      factory: function() { return foam.mlang.predicate.True.create(); }
    },
    {
      name: 'unknownExportDriverRegistry',
      factory: function() { return foam.nanos.export.ExportDriverRegistry.create(); }
    },
    'exportData',
    'exportObj',
    {
      name: 'exportAllColumns',
      view: { class: 'foam.u2.CheckBox',  label: 'Export all columns'},
      class: 'Boolean'
    },
    'exportDriverReg',
    {
      class: 'Boolean',
      name: 'isConvertAvailable'
    },
    {
      class: 'Boolean',
      name: 'isDownloadAvailable'
    },
    {
      class: 'Boolean',
      name: 'isOpenAvailable'
    },
    'exportDriver'
  ],

  methods: [
    function render() {
      var self = this;
      this.SUPER();

      this.exportDriverReg = this.unknownExportDriverRegistry;
      this.exportDriver = undefined;

      self.dataType$.sub(function() {
        self.exportDriverRegistryDAO.find(self.dataType).then(function(val) {
          if ( ! val ) {
            self.exportDriverReg = self.unknownExportDriverRegistry;
            self.exportDriver    = undefined;
          } else {
            self.exportDriverReg = val;
            self.exportDriver    = foam.lookup(self.exportDriverReg.driverName).create();
          }
        });
      });

      self.exportDriverReg$.sub(function() {
        self.isConvertAvailable  =  self.exportDriverReg.isConvertible;
        self.isDownloadAvailable = self.exportDriverReg.isDownloadable;
        self.isOpenAvailable     = self.exportDriverReg.isOpenable;
      });

      this
      .addClass(this.myClass())
      .startContext({ data: this })
        .start(this.Rows)
          .tag(this.DATA_TYPE.__)
          .add(this.slot(function (exportDriver) {
            return this.E()
              .show(exportDriver && exportDriver.cls_.getAxiomsByClass(foam.core.Property).some(p => ! p.hidden))
              .start({class: 'foam.u2.detail.VerticalDetailView', data: exportDriver}).end();
          }))
          .start()
            .style({ display: 'contents' })
            .show(this.isDataTypeSelected$)
            .start(this.NOTE.__).end()
            .add(
              self.slot(function(exportDriverReg$exportAllColumns) {
                if ( exportDriverReg$exportAllColumns ) {
                  return self.E().start().addClass('p-legal-light', 'label').startContext({ data: self }).tag(self.EXPORT_ALL_COLUMNS).endContext().end();
                }
              })
            )
            .start(this.Cols).style({ 'justify-content': 'flex-start' })
              .start(this.DOWNLOAD).end()
              .start(this.CONVERT).end()
              .start(this.OPEN).end()
            .end()
          .end()
        .end()
      .endContext();
    }
  ],

  actions: [
    {
      name: 'convert',
      isAvailable: function(isConvertAvailable) {
        return isConvertAvailable;
      },
      code: async function() {
        if ( ! this.exportData && ! this.exportObj ) {
          console.log('Neither exportData nor exportObj exist');
          return;
        }

        var filteredColumnsCopy = this.filteredTableColumns;
        if ( this.exportAllColumns )
          this.filteredTableColumns = null;

        try {
          this.note = this.exportData ?
            await this.exportDriver.exportDAO(this.__context__, this.exportData) :
            await this.exportDriver.exportFObject(this.__context__, this.exportObj);
        } finally {
          if ( this.exportAllColumns )
            this.filteredTableColumns = filteredColumnsCopy;
        }
      }
    },
    {
      name: 'download',
      isAvailable: function(isDownloadAvailable) {
        return isDownloadAvailable;
      },
      code: async function download() {
        var self = this;
        if ( ! this.exportData && ! this.exportObj ) {
          console.log('Neither exportData nor exportObj exist');
          return;
        }

        var filteredColumnsCopy = this.filteredTableColumns;
        if ( this.exportAllColumns )
          this.filteredTableColumns = null;

        var p = this.exportData ?
          Promise.resolve(this.exportDriver.exportDAO(this.__context__, this.exportData)) :
          Promise.resolve(this.exportDriver.exportFObject(this.__context__, this.exportObj));

        var exportDataResult;
        p.then(result => {
          exportDataResult = result;
          var link = document.createElement('a');
          var href = '';
          if ( self.exportDriverReg.mimeType && self.exportDriverReg.mimeType.length != 0 ) {
            var blob = new Blob([result], { type: self.exportDriverReg.mimeType });
            href = URL.createObjectURL(blob);
          } else {
            throw new Error('Data type for export not specified');
          }
          link.setAttribute('href', href);
          link.setAttribute('download', 'data.' + self.exportDriverReg.extension);
          document.body.appendChild(link);
          link.click();

          // Cleanup data blob and link
          if ( blob ) URL.revokeObjectURL(link.href);
          document.body.removeChild(link);
        }).finally(() => {
          if ( this.exportAllColumns )
            this.filteredTableColumns = filteredColumnsCopy;
        });
      }
    },
    {
      name: 'open',
      isAvailable: function(isOpenAvailable) {
        return isOpenAvailable;
      },
      code: async function() {

        var filteredColumnsCopy = this.filteredTableColumns;
        if ( this.exportAllColumns )
          this.filteredTableColumns = null;

        var url;
        try {
          url = this.exportData ?
            await this.exportDriver.exportDAO(this.__context__, this.exportData) :
            await this.exportDriver.exportFObject(this.__context__, this.exportObj);
        } finally {
          if ( this.exportAllColumns )
            this.filteredTableColumns = filteredColumnsCopy;
        }
        if ( url && url.length > 0 )
          window.location.replace(url);
      }
    }
  ]
});
