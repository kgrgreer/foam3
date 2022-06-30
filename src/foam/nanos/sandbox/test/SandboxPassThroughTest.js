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
        import foam.dao.CopyOnWriteDAO;
        import foam.test.IdentifiedStringHolder;
        import foam.core.X;
        import foam.nanos.logger.Logger;
        import java.util.ArrayList;

        import foam.nanos.sandbox.Sandbox;
        import foam.nanos.sandbox.NSpecFactoryOption;
        import foam.nanos.sandbox.PassNSpecFactory;

        var sandbox = new Sandbox();

        var factoryOptions = new ArrayList();
        {
          var option = new NSpecFactoryOption();
          option.setNSpecFactory(PassNSpecFactory.getOwnClassInfo());
          factoryOptions.add(option);
        }
        sandbox.setFactoryOptions(factoryOptions.toArray(new NSpecFactoryOption[0]));

        var x = sandbox.getSandboxRootX();
        // Note: beanshell doens't understand varargs which is why this is an array
        ((Logger) x.get("logger")).info(new String[] {"logged from the sandbox context"});
      `

    }
  ]
});
