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
  package: 'net.nanopay.meter.reports',
  name: 'Report',
  extends: 'foam.nanos.script.Script',

  tableColumns: [
    'id',
    'name',
    'description',
    'lastDuration',
    'lastRun',
    'status'
  ],

  properties: [
    {
      class: 'String',
      name: 'name',
      tableWidth: 300,
      tableCellFormatter: function(val, obj) {
        this.translate(`${obj.id}.name`, val);
      }
    },
    {
      name: 'output',
      preSet: function(_, newVal) {
        return newVal;
      },
      javaSetter: `
      output_ = val;
      outputIsSet_ = true;
      `
    },
    {
      name: 'daoKey',
      value: 'reportDAO'
    }
  ],

  actions: [
      {
        name: 'downloadCSV',
        label: 'Download CSV',  //Download CSV file for export OUTPUT data
        code: async function() {
          if ( this.output == "" )
            alert("Empty Output");
          else {
            var result = 'data:text/csv;charset=utf-8,' + this.output;
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
