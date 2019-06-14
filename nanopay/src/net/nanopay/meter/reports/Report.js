foam.CLASS({
  package: 'net.nanopay.meter.reports',
  name: 'Report',
  extends: 'foam.nanos.script.Script',

  properties: [
    {
      name: 'output',
      preSet: function(_, newVal) {
        return newVal;
      },
      javaSetter: `
      output_ = val;
      outputIsSet_ = true;
      `
    }
  ],

  actions: [
      {
        name: 'downloadCSV',
        label: 'DownloadCSV',  //Download CSV file for export OUTPUT data
        code: async function() {
          if ( this.output == "" )
            alert("Empty Output");
          else {
            result = 'data:text/csv;charset=utf-8,' + this.output;
            var encodedUri = encodeURI(result);
            var link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', this.id +'.csv');
            document.body.appendChild(link);
            link.click();
          }
        }
      }
    ]
});
