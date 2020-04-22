foam.CLASS({
  package: 'net.nanopay.script',
  name: 'CsvUploadScript',
  extends: 'foam.nanos.script.Script',
  imports: [ 'csvUploadScriptDAO as scriptDAO' ],
  properties: [
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'csv'
    },
    {
      class: 'String',
      name: 'progressId'
    },
    {
      class: 'String',
      name: 'filename'
    },
    {
      class: 'String',
      name: 'daoKey',
      value: 'csvUploadScriptDAO',
      transient: true,
      visibility: 'HIDDEN',
    }
  ],
});
