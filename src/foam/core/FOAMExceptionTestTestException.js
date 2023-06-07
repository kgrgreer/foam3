/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
   package: 'foam.core',
   name: 'FOAMExceptionTestTestException',
   extends: 'foam.core.FOAMException',
   javaGenerateConvenienceConstructor: false,
   javaGenerateDefaultConstructor: false,

   properties: [
     {
       name: 'exceptionMessage',
       value: 'ExceptionMessage {{message}}, ErrorCode: {{errorCode}}'
     }
   ],

   javaCode: `
     public FOAMExceptionTestTestException() {
       super();
     }

     public FOAMExceptionTestTestException(String message) {
       super(message);
     }

     public FOAMExceptionTestTestException(String message, String errorCode) {
       super(message, errorCode);
     }
   `
 });
