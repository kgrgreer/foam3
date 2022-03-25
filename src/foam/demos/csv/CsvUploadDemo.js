/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.csv',
  name: 'CsvUploadDemo',
  requires: [
    'foam.dao.CSVSink',
    'foam.dao.DAOSink',
    'foam.dao.EasyDAO',
    'foam.lib.csv.DynamicHeaderCSVParser'
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      adapt: function(_, o) {
        if ( foam.String.isInstance(o) )
          return this.__subContext__[o];
        return o;
      }
    },
    {
      class: 'String',
      name: 'cls',
      label: 'class',
      value: 'foam.nanos.auth.User',
      validateObj: function(cls) {
        return foam.maybeLookup(cls) ? null : 'Invalid class';
      }
    },
    {
      class: 'String',
      name: 'csv',
      view: { class: 'foam.u2.tag.TextArea' },
      value: `
id,firstName,lastName,email,phone.number,address.city,address.postalCode,lastLogin,birthday,passwordLastModified,passwordExpiry,created,lastModified
1,Mike,C,mike@c.com,416-123-1234,sauga,l4w2l2,0,1,2,3,4,5
      `
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'tempDao',
      view: { class: 'foam.comics.v2.DAOBrowserView' },
      expression: function(cls) {
        return this.EasyDAO.create({
          of: foam.maybeLookup(cls) || foam.nanos.auth.User,
          daoType: 'MDAO'
        });
      }
    },
    {
      class: 'String',
      name: 'csvOut',
      view: {
        class: 'foam.u2.HTMLView',
        nodeName: 'pre'
      },
      visibiliy: 'RO'
    }
  ],
  actions: [
    {
      name: 'parse',
      code: function() {
        // A bit of a hack around the fact that we don't have a MultiSink.
        var sinks = [
          this.CSVSink.create(),
          this.DAOSink.create({ dao: this.tempDao })
        ];
        var sink = {
          put: function(o) {
            sinks.forEach(s => s.put(o));
          }
        };
        this.DynamicHeaderCSVParser.create().fromCSV(this.tempDao.of, this.csv.trim(), sink);
        this.csvOut = sinks[0].csv;
      }
    },
    {
      name: 'useOutputAsInput',
      isEnabled: function(csvOut) {
        return !! csvOut;
      },
      code: function() {
        this.csv = this.csvOut;
        this.csvOut = undefined;
      }
    },
    {
      name: 'save',
      code: function() {
        this.tempDao.select(function(obj){
          dao.put(obj);
        });
      }
    }
  ]
});
