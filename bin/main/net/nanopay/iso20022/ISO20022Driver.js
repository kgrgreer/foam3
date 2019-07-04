foam.CLASS({
  package: 'net.nanopay.iso20022',
  name: 'ISO20022Driver',
  implements: [ 'foam.nanos.export.ExportDriver' ],

  documentation: 'Class for exporting to ISO20022 XML format',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.xml.Outputter',
      name: 'outputter',
      factory: function () { return foam.xml.Pretty; }
    }
  ],

  methods: [
    function outputISO20022Schema(cls) {
      switch ( cls.name ) {
        case 'Pacs00800106':
          this.outputter.out(' xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.06"');
          break;
        case 'Pain00700107':
          this.outputter.out(' xmlns="urn:iso:std:iso:20022:tech:xsd:pain.007.001.07"');
          break;
        case 'Tsin00400101':
          this.outputter.out(' xmlns="urn:iso:std:iso:20022:tech:xsd:tsin.004.001.01"');
          break;
      }
    },
    function exportFObject(X, obj) {
      this.outputter.out('<?xml version="1.0" encoding="UTF-8"?>').nl().indent();
      this.outputter.out('<Document');
      this.outputISO20022Schema(obj.cls_);
      this.outputter.out(' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">');
      this.outputter.indentLevel_++;
      this.outputter.output(obj);
      this.outputter.indentLevel_--;
      this.outputter.nl().indent().out('</Document>');
      var ret = this.outputter.buf_;
      this.outputter.reset();
      return ret;
    },
    function exportDAO(X, dao) {
      var self = this;
      return dao.select().then(function (sink) {
        return self.outputter.stringify(sink.array);
      });
    }
  ]
});