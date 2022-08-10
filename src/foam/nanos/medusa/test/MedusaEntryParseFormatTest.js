/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa.test',
  name: 'MedusaEntryParseFormatTest',
  extends: 'foam.nanos.test.Test',

  documentation: `Test MedusaEntry data serialization/deserialization with respect to transient and non-transient properties`,

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.lib.json.JSONParser',
    'foam.nanos.medusa.*',
    'foam.util.SafetyUtil'
  ],

  javaCode: `
    // formatters from SocketConnectionBox for serializing MedusaEntry itself.
    protected static final ThreadLocal<foam.lib.formatter.FObjectFormatter> formatter_ = new ThreadLocal<foam.lib.formatter.FObjectFormatter>() {
      @Override
      protected foam.lib.formatter.JSONFObjectFormatter initialValue() {
        foam.lib.formatter.JSONFObjectFormatter formatter = new foam.lib.formatter.JSONFObjectFormatter();
        formatter.setQuoteKeys(true);
        formatter.setPropertyPredicate(new foam.lib.ClusterPropertyPredicate());
        return formatter;
      }

      @Override
      public foam.lib.formatter.FObjectFormatter get() {
        foam.lib.formatter.FObjectFormatter formatter = super.get();
        formatter.reset();
        return formatter;
      }
    };

      protected ThreadLocal<JSONParser> parser_ = new ThreadLocal<JSONParser>() {
      @Override
      protected JSONParser initialValue() {
        return getX().create(JSONParser.class);
      }
    };
  `,

  methods: [
    {
      name: 'runTest',
      javaCode: `
      MedusaEntrySupport entrySupport = (MedusaEntrySupport) x.get("medusaEntrySupport");

      String value = "nu";

      MedusaTestObject nuMto = new MedusaTestObject();
      nuMto.setId(value);
      nuMto.setData(value);
      nuMto.setClusterTransientData(value);
      nuMto.setNetworkTransientData(value);
      nuMto.setStorageTransientData(value);
      nuMto.setTransientData(value);

      MedusaTestObjectNested nuNested = new MedusaTestObjectNested();
      nuNested.setData(value);
      nuNested.setClusterTransientData(value);
      nuNested.setNetworkTransientData(value);
      nuNested.setStorageTransientData(value);
      nuNested.setTransientData(value);

      nuMto.setClusterTransientFObject(nuNested);
      nuMto.setNestedFObject(nuNested);
      nuMto.setNetworkTransientFObject(nuNested);
      nuMto.setStorageTransientFObject(nuNested);
      nuMto.setTransientFObject(nuNested);

      // test 1 - new object
      MedusaEntry nuEntry = new MedusaEntry();
      nuEntry.setId(1L);
      nuEntry.setData(entrySupport.data(x, nuMto, null, DOP.PUT));
      nuEntry.setTransientData(entrySupport.transientData(x, nuMto, null, DOP.PUT));

      foam.lib.formatter.FObjectFormatter formatter = formatter_.get();
      formatter.setX(getX());
      formatter.output(nuEntry);
      String message = formatter.builder().toString();
      test ( ! SafetyUtil.isEmpty(message), "MedusaEntry serialized");

      MedusaEntry me = (MedusaEntry) parser_.get().parseString(message);

      test ( me != null, "MedusaEntry deserialized");
      MedusaTestObject oldMto = (MedusaTestObject) validate(me, false);

      // Update
      value = "updated";
      MedusaTestObject mto = (MedusaTestObject) oldMto.fclone();
      mto.setData(value);
      mto.setClusterTransientData(value);
      mto.setNetworkTransientData(value);
      mto.setStorageTransientData(value);
      mto.setTransientData(value);
      MedusaTestObjectNested nested = mto.getClusterTransientFObject();
      if ( nested == null ) {
        nested = new MedusaTestObjectNested();
      }
      nested.setData(value);
      mto.setClusterTransientFObject(nested);

      nested = mto.getNestedFObject();
      if ( nested == null ) {
        nested = new MedusaTestObjectNested();
      }
      nested.setData(value);
      mto.setNestedFObject(nested);

      nested = mto.getNetworkTransientFObject();
      if ( nested == null ) {
        nested = new MedusaTestObjectNested();
      }
      nested.setData(value);
      mto.setNetworkTransientFObject(nested);

      nested = mto.getStorageTransientFObject();
      if ( nested == null ) {
        nested = new MedusaTestObjectNested();
      }
      nested.setData(value);
      nested.setClusterTransientData(value);
      nested.setNetworkTransientData(value);
      nested.setStorageTransientData(value);
      nested.setTransientData(value);
      mto.setStorageTransientFObject(nested);

      if ( oldMto != null ) {
        MedusaTestObjectNested t = oldMto.getStorageTransientFObject();
        test ( nested.compareTo(t) != 0, "clone nested different");
      }

      nested = mto.getTransientFObject();
      if ( nested == null ) {
        nested = new MedusaTestObjectNested();
      }
      nested.setData(value);
      mto.setTransientFObject(nested);

      MedusaEntry entry = new MedusaEntry();
      entry.setId(2L);
      entry.setData(entrySupport.data(x, mto, oldMto, DOP.PUT));
      entry.setTransientData(entrySupport.transientData(x, mto, oldMto, DOP.PUT));

      formatter = formatter_.get();
      formatter.setX(getX());
      formatter.output(entry);
      message = formatter.builder().toString();
      test ( ! SafetyUtil.isEmpty(message), "MedusaEntry (update) serialized");

      entry = (MedusaEntry) parser_.get().parseString(message);

      test ( entry != null, "MedusaEntry (update) deserialized");

      validate(entry, true);
      `
    },
    {
      name: 'validate',
      args: 'MedusaEntry entry, boolean update',
      type: 'foam.core.FObject',
      javaCode: `
      String DT = "D ";
      if ( update ) DT = "DU ";

      MedusaTestObject dataMto = (MedusaTestObject) parser_.get().parseString(entry.getData());
      test ( dataMto != null, DT+"MedusaTestObject deserialized");
      test ( ! SafetyUtil.isEmpty(dataMto.getData()), DT+"data != null");
      test ( SafetyUtil.isEmpty(dataMto.getClusterTransientData()), DT+"clusteredTransientData == null");
      test ( ! SafetyUtil.isEmpty(dataMto.getNetworkTransientData()), DT+"networkTransientData != null");
      test ( SafetyUtil.isEmpty(dataMto.getStorageTransientData()), DT+"storageTransientData == null");
      test ( SafetyUtil.isEmpty(dataMto.getTransientData()), DT+"transientData == null");
      test ( dataMto.getClusterTransientFObject() == null, DT+"clusterTransientFObject == null");
      test ( dataMto.getNestedFObject() != null, DT+"nestedFObject != null");
      test ( dataMto.getNetworkTransientFObject() != null, DT+"networkTransientFObject != null");
      test ( dataMto.getStorageTransientFObject() == null, DT+"storageTransientFObject ==null");
      test ( dataMto.getTransientFObject() == null, DT+"transientFObject == null");

      DT = "T ";
      if ( update ) DT = "TU ";

      MedusaTestObject transientMto = (MedusaTestObject) parser_.get().parseString(entry.getTransientData());
      test ( transientMto != null, DT+"MedusaTestObject deserialized");
      test ( SafetyUtil.isEmpty(transientMto.getData()), DT+"data == null");
      test ( SafetyUtil.isEmpty(transientMto.getClusterTransientData()), DT+"clusteredTransientData == null");
      test ( SafetyUtil.isEmpty(transientMto.getNetworkTransientData()), DT+"networkTransientData == null");
      test ( ! SafetyUtil.isEmpty(transientMto.getStorageTransientData()), DT+"storageTransientData != null");
      test ( SafetyUtil.isEmpty(transientMto.getTransientData()), DT+"transientData == null");
      test ( transientMto.getClusterTransientFObject() == null, DT+"clusterTransientFObject == null");
      test ( transientMto.getNestedFObject() == null, DT+"nestedFObject == null");
      test ( transientMto.getNetworkTransientFObject() == null, DT+"networkTransientFObject == null");
      test ( transientMto.getStorageTransientFObject() != null, DT+"storageTransientFObject != null");
      test ( transientMto.getTransientFObject() == null, DT+"transientFObject == null");

      MedusaTestObjectNested n = (MedusaTestObjectNested) (transientMto.getStorageTransientFObject());
      test ( ! SafetyUtil.isEmpty(n.getData()), DT+"storageTransient nested data != null");
      test ( SafetyUtil.isEmpty(n.getClusterTransientData()), DT+"storageTransient nested clusterTransientData == null");
      test ( ! SafetyUtil.isEmpty(n.getNetworkTransientData()), DT+"storageTransient nested networkTransientData != null");
      test ( ! SafetyUtil.isEmpty(n.getStorageTransientData()), DT+"storageTransient nested storageTransientData != null");
      test ( SafetyUtil.isEmpty(n.getTransientData()), DT+"storageTransient nested transientData == null");

      n = (MedusaTestObjectNested) (transientMto.getNetworkTransientFObject());
      test ( n == null, DT+"networkTransientFObject null");

      return (MedusaTestObject) dataMto.overlay(transientMto);
      `
    }
  ]
});
