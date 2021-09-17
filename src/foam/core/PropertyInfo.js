/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.core',
  name: 'PropertyInfo',

  javaImports: [
    'foam.crypto.hash.Hasher',
    'foam.crypto.sign.Signer',
    'foam.dao.jdbc.IndexedPreparedStatement',
    'foam.dao.SQLStatement',
    'foam.lib.parse.Parser',
    'foam.mlang.Expr',
    'foam.mlang.order.Comparator',
    'java.util.Map',
    'javax.xml.stream.XMLStreamReader'
  ],

  javaExtends: [
    'Axiom',
    'ClassInfoAware',
    'Comparable',
    'Comparator',
    'Expr',
    'Hasher',
    'Signer',
    'SQLStatement',
    'Validator'
  ],

  // TODO: break into XML, CSV, SQL, Sheets, PII, crypto
  methods: [
    'boolean getExternalTransient() { return false; }',
    'boolean getNetworkTransient() { return false; }',
    'boolean getReadPermissionRequired() { return false; }',
    'boolean getWritePermissionRequired() { return false; }',
    'boolean getStorageTransient() { return false; }',
    'boolean getStorageOptional() { return false; }',
    'boolean getClusterTransient() { return false; }',
    'boolean getXMLAttribute() { return false; }',
    'boolean getXMLTextNode() { return false; }',
    'boolean getRequired() { return false; }',
    'java.lang.Class getValueClass()',
    'String getName()',
    'String[] getAliases()',
    'String getShortName() { return null; }',
    'byte[] getNameAsByteArray()',
    'Object get(Object obj)',
    'void set(Object obj, Object value)',
    'void clear(Object obj)',
    'Parser jsonParser()',
    'Parser queryParser()',
    'Parser csvParser()',
    'void toJSON(foam.lib.json.Outputter outputter, Object value) { outputter.output(value); }',
    'void format(foam.lib.formatter.FObjectFormatter outputter, FObject obj)',
    'void formatJSON(foam.lib.formatter.FObjectFormatter formatter, FObject obj) { format(formatter, obj); }',
    'void toCSV(X x, Object obj, foam.lib.csv.CSVOutputter outputter) { outputter.outputValue(obj != null ? get(obj) : null); }',
    'void toCSVLabel(X x, foam.lib.csv.CSVOutputter outputter) { outputter.outputValue(getName()); }',
    'void toXML(foam.lib.xml.Outputter outputter, Object value)',
    'void diff(FObject o1, FObject o2, Map diff, PropertyInfo prop)',
    {
      signature: 'boolean hardDiff(FObject o1, FObject o2, FObject diff)',
      documentation: `
        return true if there are difference, then the property value from o2 will set to diff
        return false if there is no differnce, then null will be set to diff
      `
    },
    'Object fromString(String value)',
    'void setFromString(Object obj, String value)',
    'Object fromXML(X x, XMLStreamReader reader)',
    'int comparePropertyToObject(Object key, Object o)',
    'int comparePropertyToValue(Object key, Object value)',
    'String getSQLType()',
    'boolean includeInID()',
    'boolean isSet(Object obj)',
    'boolean isDefaultValue(Object obj)',
    'void setStatementValue(IndexedPreparedStatement stmt, FObject o) throws java.sql.SQLException',
    'void setFromResultSet(java.sql.ResultSet resultSet, int index, FObject o) throws java.sql.SQLException',
    'void cloneProperty(FObject source, FObject dest)',
    'boolean containsPII()',
    'boolean containsDeletablePII()',
    `void validateObj(foam.core.X x, foam.core.FObject obj) {
       /* Template Method: override in subclass if required. */
       if ( getRequired() && ! isSet(obj) ) {
         throw new ValidationException(getName() + " required");
       }
    }`,
    'void fromCSVLabelMapping(java.util.Map<String,foam.lib.csv.FromCSVSetter> map)',
    'boolean getSheetsOutput()',
    'Object castObject(Object value) { return value; }'
  ]
});
