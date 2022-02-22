/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.google.api.sheets.views',
  name: 'ClientGoogleSheetsDataImportService',
  implements: [
    'foam.nanos.google.api.sheets.views.GoogleSheetsDataImportService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.google.api.sheets.views.GoogleSheetsDataImportService',
      name: 'delegate'
    }
  ]
});
