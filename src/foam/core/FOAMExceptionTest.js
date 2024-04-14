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
        String res = e.renderMessage(e.getExceptionMessage());
        test(res == null || expected.equals(res), "expecting: "+expected+", found: \\\""+res+"\\\"");
      }
      try {
        throw new FOAMException("test message");
      } catch (FOAMException e) {
        String expected = "test message";
        String res = e.renderMessage(e.getExceptionMessage());
        test(expected.equals(res), "expecting: "+expected+", found: \\\""+res+"\\\"");
      }

      try {
        throw new FOAMExceptionTestTestException();
      } catch (FOAMExceptionTestTestException e) {
        String expected = "ExceptionMessage , ErrorCode:";
        String res = e.renderMessage(e.getExceptionMessage());
        test(expected.equals(res), "expecting: "+expected+", found: \\\""+res+"\\\"");
      }
      try {
        throw new FOAMExceptionTestTestException("inner message");
      } catch (FOAMExceptionTestTestException e) {
        String expected = "ExceptionMessage inner message, ErrorCode:";
        String res = e.renderMessage(e.getExceptionMessage());
        test(expected.equals(res), "expecting: "+expected+", found: \\\""+res+"\\\"");
      }

      // test templating
      try {
        throw new FOAMExceptionTestTestException("inner message", "16");
      } catch (FOAMExceptionTestTestException e) {
        String expected = "ExceptionMessage inner message, ErrorCode: 16";
        String res = e.renderMessage(e.getExceptionMessage());
        test(expected.equals(res), "expecting: "+expected+", found: \\\""+res+"\\\"");
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
