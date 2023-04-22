/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.bench',
  name: 'BenchmarkResultSystemDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Capture System and Runtime properties to BenchmarkResult`,

  javaImports: [
    'foam.util.SafetyUtil',
    'java.math.BigDecimal',
    'java.math.RoundingMode'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      BenchmarkResult br = (BenchmarkResult) obj;

      // br.setJavaVmInfo(System.getProperty("java.vm.info"));

      // br.setJavaVersion(System.getProperty("java.version"));
      // br.setJavaCompiler(System.getProperty("java.compiler"));
      br.setJavaFullversion(String.valueOf(Runtime.version().version().get(0)));
      // br.setJavaRuntimeVersion(System.getProperty("java.runtime.version"));
      br.setOsArch(System.getProperty("os.arch"));
      br.setOsName(System.getProperty("os.name"));
      // br.setSunArchDataModel(System.getProperty("sun.arch.data.model"));
      // br.setJavaVmName(System.getProperty("java.vm.name"));
      // br.setJavaVmVersion(System.getProperty("java.vm.version"));

      br.setCores(Runtime.getRuntime().availableProcessors());

      // NOTE: mulitiple gc calls to trigger stages of gc process - Mark and Sweep, Finalizers, ...
      Runtime.getRuntime().gc();
      Runtime.getRuntime().gc();

      br.setUsedMemoryGB(new BigDecimal(((Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory())) / 1024.0 / 1024.0 / 1024.0).setScale(2, RoundingMode.HALF_UP).floatValue());
      br.setFreeMemoryGB(new BigDecimal(((Runtime.getRuntime().freeMemory())) / 1024.0 / 1024.0 / 1024.0).setScale(2, RoundingMode.HALF_UP).floatValue());
      br.setTotalMemoryGB(new BigDecimal(((Runtime.getRuntime().totalMemory())) / 1024.0 / 1024.0 / 1024.0).setScale(2, RoundingMode.HALF_UP).floatValue());
      br.setMaxMemoryGB(new BigDecimal(((Runtime.getRuntime().maxMemory())) / 1024.0 / 1024.0 / 1024.0).setScale(2, RoundingMode.HALF_UP).floatValue());

      return getDelegate().put_(x, br);
      `
    }
  ]
});
