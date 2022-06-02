/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.google.api.sheets.views.modal',
  name: 'ImportFromGoogleSheetsForm',
  extends: 'foam.nanos.google.api.sheets.views.wizardModal.WizardModal',

  imports: [
    'config'
  ],

  exports: [
    'importConfig'
  ],
  css: `
    ^ {
      width: 500px;
      height: 500px;
      overflow-x: auto;
    }
  `,
  properties: [
    {
      name: 'importConfig',
      class: 'FObjectProperty',
      of: 'foam.nanos.google.api.sheets.views.GoogleSheetsImportConfig',
      expression: function(of, dao) {
        return foam.nanos.google.api.sheets.views.GoogleSheetsImportConfig.create({importClassInfo: of, DAO: dao.includes('/') ? dao.split('/')[1] : dao });
      }
    },
    'of',
    'dao'
  ],
  methods: [
    function init() {
      this.SUPER();
      this.views = {
        'googleSheetLink'        : { view: { class: 'foam.nanos.google.api.sheets.views.modal.GoogleSheetImportModal' }, startPoint: true },
        'columnsMapping'         : { view: { class: 'foam.nanos.google.api.sheets.views.modal.ColumnsToPropertiesMappingModal' } }
      };
    },

    function render() {
      this.SUPER();
      this.addClass();
    }
  ]
});
