/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'FOAMExceptionTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.i18n.TranslationService',
  ],

  methods: [
    {
      name: 'runTest',

      javaCode: `

      try {
        throw new FOAMException();
      } catch (FOAMException e) {
        String expected = "";
        test(e.getMessage() == null || expected.equals(e.getMessage()), "expecting: "+expected+", found: \\\""+e.getMessage()+"\\\"");
      }
      try {
        throw new FOAMException("test message");
      } catch (FOAMException e) {
        String expected = "test message";
        test(expected.equals(e.getMessage()), "expecting: "+expected+", found: \\\""+e.getMessage()+"\\\"");
      }

      try {
        throw new FOAMExceptionTestTestException();
      } catch (FOAMExceptionTestTestException e) {
        String expected = "ExceptionMessage , ErrorCode:";
        test(expected.equals(e.getMessage()), "expecting: "+expected+", found: \\\""+e.getMessage()+"\\\"");
      }
      try {
        throw new FOAMExceptionTestTestException("inner message");
      } catch (FOAMExceptionTestTestException e) {
        String expected = "ExceptionMessage inner message, ErrorCode:";
        test(expected.equals(e.getMessage()), "expecting: "+expected+", found: \\\""+e.getMessage()+"\\\"");
      }

      // test templating
      try {
        throw new FOAMExceptionTestTestException("inner message", "16");
      } catch (FOAMExceptionTestTestException e) {
        String expected = "ExceptionMessage inner message, ErrorCode: 16";
        test(expected.equals(e.getMessage()), "expecting: "+expected+", found: \\\""+e.getMessage()+"\\\"");
        System.out.println("toString: "+e.toString());
      }

      // different locale
      TranslationService ts = (TranslationService) x.get("translationService");
      test(ts != null, "TranslationService");

      X y = x.put("locale.language", "pt");
      XLocator.set(y);
      try {
        throw new FOAMExceptionTestTestException("inner message", "16");
      } catch (FOAMExceptionTestTestException e) {
        String expected = "MensagemDeExceção inner message, ErroDeCódigo: 16";
        test(expected.equals(e.getTranslation()), "expecting: "+expected+", found: \\\""+e.getTranslation()+"\\\"");
        System.out.println("toString: "+e.toString());
      }
      XLocator.set(x);
      `
    }
  ]
});

/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  name: 'FOAMExceptionTestTestException',
  package: 'foam.core',
  extends: 'foam.core.FOAMException',
  javaGenerateConvenienceConstructor: false,
  javaGenerateDefaultConstructor: false,

  properties: [
    {
      name: 'exceptionMessage',
      value: 'ExceptionMessage {{message}}, ErrorCode: {{errorCode}}'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
  public FOAMExceptionTestTestException() {
    super();
  }

  public FOAMExceptionTestTestException(String message) {
    super(message);
  }

  public FOAMExceptionTestTestException(String message, String errorCode) {
    super(message, errorCode);
  }
        `);
      }
    }
  ],
});
