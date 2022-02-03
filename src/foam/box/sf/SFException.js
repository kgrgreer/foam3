/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
	package: 'foam.box.sf',
  name: 'SFException',
  javaExtends: 'foam.core.FOAMException',

  javaCode: `
    public SFException(String message) {
      super(message);
    }

    public SFException(String message, Throwable cause) {
      super(message, cause);
		}
		
		public SFException(Throwable cause) {
      super("SFException", cause);
    }
  `
});
