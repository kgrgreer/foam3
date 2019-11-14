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
  ],
});
