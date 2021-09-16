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

  methods: [
   { signature: 'boolean getExternalTransient()' },
   { signature: 'boolean getNetworkTransient()' },
   { signature: 'boolean getReadPermissionRequired()' },
   { signature: 'boolean getWritePermissionRequired()' },
   { signature: 'boolean getStorageTransient()' },
   { signature: 'boolean getStorageOptional()' },
   { signature: 'boolean getClusterTransient()' },
   { signature: 'boolean getXMLAttribute()' },
   { signature: 'boolean getXMLTextNode()' },
   { signature: 'boolean getRequired()' },
   { signature: 'java.lang.Class getValueClass()' },
   { signature: 'String getName()' },
   { signature: 'String[] getAliases()' },
   { signature: 'String getShortName()' },
   { signature: 'byte[] getNameAsByteArray()' },
   { signature: 'Object get(Object obj)' },
   { signature: 'void set(Object obj, Object value)' },
   { signature: 'void clear(Object obj)' },
   { signature: 'Parser jsonParser()' },
   { signature: 'Parser queryParser()' },
   { signature: 'Parser csvParser()' },
   { signature: 'void toJSON(foam.lib.json.Outputter outputter, Object value)' },
   { signature: 'void format(foam.lib.formatter.FObjectFormatter outputter, FObject obj)' },
   { signature: 'void formatJSON(foam.lib.formatter.FObjectFormatter formatter, FObject obj)' },
   { signature: 'void toCSV(X x, Object obj, foam.lib.csv.CSVOutputter outputter)' },
   { signature: 'void toCSVLabel(X x, foam.lib.csv.CSVOutputter outputter)' },
   { signature: 'void toXML(foam.lib.xml.Outputter outputter, Object value)' },
   { signature: 'void diff(FObject o1, FObject o2, Map diff, PropertyInfo prop)' },
  //return true if there are difference, then the property value from o2 will set to diff
  //return false if there is no differnce, then null will be set to diff
   { signature: 'boolean hardDiff(FObject o1, FObject o2, FObject diff)' },
   { signature: 'Object fromString(String value)' },
   { signature: 'void setFromString(Object obj, String value)' },
   { signature: 'Object fromXML(X x, XMLStreamReader reader)' },
   { signature: 'int comparePropertyToObject(Object key, Object o)' },
   { signature: 'int comparePropertyToValue(Object key, Object value)' },
   { signature: 'String getSQLType()' },
   { signature: 'boolean includeInID()' },
   { signature: 'boolean isSet(Object obj)' },
   { signature: 'boolean isDefaultValue(Object obj)' },
   { signature: 'void setStatementValue(IndexedPreparedStatement stmt, FObject o) throws java.sql.SQLException' },
   { signature: 'void setFromResultSet(java.sql.ResultSet resultSet, int index, FObject o) throws java.sql.SQLException' },
   { signature: 'void cloneProperty(FObject source, FObject dest)' },
   { signature: 'boolean containsPII()' },
   { signature: 'boolean containsDeletablePII()' },
   { signature: 'void validateObj(foam.core.X x, foam.core.FObject obj)' },
/*
   {
     name: 'fromCSVLabelMapping',
     type: 'void',
     args: [
       {
         name: 'map',
         type: 'java.util.Map<String,foam.lib.csv.FromCSVSetter>'
       }
     ]
   },
*/
   { signature: 'void fromCSVLabelMapping(java.util.Map<String,foam.lib.csv.FromCSVSetter> map)' },
   { signature: 'boolean getSheetsOutput()' },
   { signature: 'Object castObject(Object value)' }
 ]
});
