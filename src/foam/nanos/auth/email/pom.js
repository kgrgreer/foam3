/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
  name: 'email',
  files: [
    { name: 'EmailVerificationCode', flags: 'js|java' },
    { name: 'VerificationCodeView', flags: 'js' },
    { name: 'ClientEmailVerificationService', flags: 'js' },
    { name: 'EmailVerificationService', flags: 'js|java' },
    { name: 'ServerEmailVerificationService', flags: 'js|java' }
  ]
});