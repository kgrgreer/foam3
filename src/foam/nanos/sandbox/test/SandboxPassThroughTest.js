/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.sandbox.test',
  name: 'SandboxPassThroughTest',
  extends: 'foam.nanos.test.Test',

  properties: [
    {
      name: 'code',
      value: `
        import foam.dao.ArraySink;
        import foam.dao.MDAO;
        import foam.dao.MapDAO;
        import foam.dao.CopyOnWriteDAO;
        import foam.test.IdentifiedStringHolder;
        import foam.core.X;
        import java.util.ArrayList;

        import foam.nanos.crunch.Capability;
        import foam.nanos.boot.NSpec;

        import foam.nanos.sandbox.Sandbox;
        import foam.nanos.sandbox.NSpecFactoryOption;
        import foam.nanos.sandbox.PassNSpecFactory;
        import foam.nanos.sandbox.ValueNSpecFactory;

        import static foam.mlang.MLang.*;

        var sandbox = new Sandbox();
        sandbox.setX(x);

        var testCapabilityDAO = new MapDAO(Capability.getOwnClassInfo());

        var testCapability = new Capability();
        testCapability.setId("testCapability");
        testCapabilityDAO.put(testCapability);

        var factoryOptions = new ArrayList();
        {
          var option = new NSpecFactoryOption();
          option.setNSpecFactory(ValueNSpecFactory.getOwnClassInfo());
          option.getArgs().put("value", testCapabilityDAO);
          option.setNSpecPredicate(EQ(NSpec.NAME, "capabilityDAO"));
          factoryOptions.add(option);
        }
        {
          var option = new NSpecFactoryOption();
          option.setNSpecFactory(PassNSpecFactory.getOwnClassInfo());
          factoryOptions.add(option);
        }
        sandbox.setFactoryOptions(factoryOptions.toArray(new NSpecFactoryOption[0]));

        var xs = sandbox.getSandboxRootX();
        
        var hopefullyTestCapabilityDAO = xs.get("capabilityDAO");
        test(hopefullyTestCapabilityDAO == testCapabilityDAO, "context factory ok");
        test(hopefullyTestCapabilityDAO != x.get("capabilityDAO") , "dao replaced");

        var obj = hopefullyTestCapabilityDAO.find("testCapability");
        test(obj != null, "testCapability found");
      `

    }
  ]
});
