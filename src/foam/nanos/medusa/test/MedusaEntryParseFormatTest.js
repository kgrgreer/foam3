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

      String oldValue = "old";
      String nuValue = "nu";

      MedusaTestObject nuMto = new MedusaTestObject();
      nuMto.setId(nuValue);
      nuMto.setData(nuValue);
      nuMto.setClusterTransientData(nuValue);
      nuMto.setNetworkTransientData(nuValue);
      nuMto.setStorageTransientData(nuValue);
      nuMto.setTransientData(nuValue);

      MedusaTestObjectNested nuNested = new MedusaTestObjectNested();
      nuNested.setData(nuValue);
      nuNested.setClusterTransientData(nuValue);
      nuNested.setNetworkTransientData(nuValue);
      nuNested.setStorageTransientData(nuValue);
      nuNested.setTransientData(nuValue);

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

      MedusaTestObject dataMto = (MedusaTestObject) parser_.get().parseString(me.getData());
      test ( dataMto != null, "D MedusaTestObject deserialized");
      test ( ! SafetyUtil.isEmpty(dataMto.getData()), "D data != null");
      test ( SafetyUtil.isEmpty(dataMto.getClusterTransientData()), "D clusteredTransientData == null");
      test ( ! SafetyUtil.isEmpty(dataMto.getNetworkTransientData()), "D networkTransientData != null");
      test ( SafetyUtil.isEmpty(dataMto.getStorageTransientData()), "D storageTransientData == null");
      test ( SafetyUtil.isEmpty(dataMto.getTransientData()), "D transientData == null");
      test ( dataMto.getClusterTransientFObject() == null, "D clusterTransientFObject == null");
      test ( dataMto.getNestedFObject() != null, "D nestedFObject != null");
      test ( dataMto.getNetworkTransientFObject() != null, "D networkTransientFObject != null");
      test ( dataMto.getStorageTransientFObject() == null, "D storageTransientFObject ==null");
      test ( dataMto.getTransientFObject() == null, "D transientFObject == null");

      MedusaTestObject transientMto = (MedusaTestObject) parser_.get().parseString(me.getTransientData());
      test ( transientMto != null, "T MedusaTestObject deserialized");
      test ( SafetyUtil.isEmpty(transientMto.getData()), "T data == null");
      test ( SafetyUtil.isEmpty(transientMto.getClusterTransientData()), "T clusteredTransientData == null");
      test ( SafetyUtil.isEmpty(transientMto.getNetworkTransientData()), "T networkTransientData == null");
      test ( ! SafetyUtil.isEmpty(transientMto.getStorageTransientData()), "T storageTransientData != null");
      test ( SafetyUtil.isEmpty(transientMto.getTransientData()), "T transientData == null");
      test ( transientMto.getClusterTransientFObject() == null, "T clusterTransientFObject == null");
      test ( transientMto.getNestedFObject() == null, "T nestedFObject == null");
      test ( transientMto.getNetworkTransientFObject() == null, "T networkTransientFObject == null");
      test ( transientMto.getStorageTransientFObject() != null, "T storageTransientFObject != null");
      test ( transientMto.getTransientFObject() == null, "T transientFObject == null");
      MedusaTestObjectNested n = (MedusaTestObjectNested) (transientMto.getStorageTransientFObject());
      test ( ! SafetyUtil.isEmpty(n.getData()), "T storageTransient nested data != null");
      test ( SafetyUtil.isEmpty(n.getClusterTransientData()), "T storageTransient nested clusterTransientData == null");
      test ( ! SafetyUtil.isEmpty(n.getNetworkTransientData()), "T storageTransient nested networkTransientData != null");
      test ( ! SafetyUtil.isEmpty(n.getStorageTransientData()), "T storageTransient nested storageTransientData != null");
      test ( SafetyUtil.isEmpty(n.getTransientData()), "T storageTransient nested transientData == null");
      `
    }
  ]
});
