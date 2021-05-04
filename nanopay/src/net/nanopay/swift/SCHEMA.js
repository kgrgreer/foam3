/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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

foam.LIB({
  name: 'net.nanopay.swift',

  methods: [
    function SCHEMA(schema) {
      var properties = [];
      var mandatoryFieldLabel = 'M'

      schema.properties.forEach(function(p) {
        // for each schema.properties convert to a FOAM property
        var prop = net.nanopay.swift.swiftToFOAMProperty(p);
        if ( prop )
          properties.push(prop.create({ messageField: parseInt(p[0]), required: p[2] == mandatoryFieldLabel }));
      });

      var model = {
        package: 'net.nanopay.swift.mt',
        name: 'MT' + schema.id,
        extends: 'net.nanopay.swift.mt.AbstractMT',
        properties: properties
      };

      foam.CLASS(model);
   },
   function swiftToFOAMProperty(p) {  
    return foam.lookup('net.nanopay.swift.fields.FieldTag' + p[1]);
   },
   function MT_TO_SWIFT_SCHEMA(mt) {
     //this function takes Message Type(MT) model as an `mt` parameter and converts it to MT schema
    var fieldTagLength = 8;
    var mtLength = 2;
    var mandatoryFieldLabel = 'M';
    var optionalFieldLabel = 'O';

    var id = mt.name.length > mtLength ? mt.name.slice(mtLength) : '';
    var clsProperties = mt.getAxiomsByClass(foam.core.Property);
    var shemaProperties = [];

    for ( var i = 0 ; i < clsProperties.length ; i++ ) {
      var prop = clsProperties[i];
      if ( prop.cls_.name.length > fieldTagLength )
        shemaProperties.push([prop.messageField, prop.cls_.name.slice(fieldTagLength), prop.required ? mandatoryFieldLabel : optionalFieldLabel, prop.name, prop.label]);
    }

    return {id: id, properties: shemaProperties};
  }
]
});
