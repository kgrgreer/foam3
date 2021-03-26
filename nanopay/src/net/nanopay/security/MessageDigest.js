/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.security',
  name: 'MessageDigest',

  documentation: 'Modelled version of the output of hash function',

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.StdoutLogger',
    'foam.util.SafetyUtil',
    'org.bouncycastle.util.encoders.Hex',
    'java.nio.charset.StandardCharsets',
    'java.util.Arrays'
  ],

  properties: [
    {
      documentation: 'Hashing algorithm identifier.',
      name: 'algorithm',
      class: 'String',
      value: 'SHA-256',
      createVisibility: function(isEdit) {
        return isEdit ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;},
      updateVisibility: function() {
        return foam.u2.DisplayMode.RO;
      }
    },
    {
      documentation: 'Hashing algorithm provider.',
      name: 'provider',
      class: 'String',
      createVisibility: function(isEdit) {
        return isEdit ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;},
      updateVisibility: function() {
        return foam.u2.DisplayMode.RO;
      }
    },
    {
      documentation: 'Current digest in String form.',
      name: 'digest',
      class: 'String',
      visibility: 'RO',
    },
    {
      name: 'rollDigests',
      class: 'Boolean',
      value: true,
      createVisibility: function(isEdit) {
        return isEdit ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;},
      updateVisibility: function() {
        return foam.u2.DisplayMode.RO;
      },
      transient: true
    },
    {
      documentation: 'Previous digest to use in rolling.',
      name: 'previousDigest',
      class: 'Object',
      visibility: 'HIDDEN',
      transient: true
    },
    {
      name: 'md',
      class: 'Object',
      javaFactory: 'return instance();',
      visibility: 'HIDDEN',
      transient: true
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        Logger logger = (Logger) getX().get("logger");
        if ( logger == null ) {
          logger = new StdoutLogger();
        }
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, logger);
      `
    },
  ],

  methods: [
    {
      name: 'init_',
      javaCode: `
      // NOTE: explicitly set true to always output
      setAlgorithm(getAlgorithm());
      instance();
      `
    },
    {
      documentation: 'return self after preparing digest with current md.digest',
      name: 'get',
      type: 'net.nanopay.security.MessageDigest',
      javaCode: `
      roll();
      return this;
      `
    },
    {
      name: 'instance',
      type: 'java.security.MessageDigest',
      javaCode: `
      try {
        // TODO: use provider
        return java.security.MessageDigest.getInstance(getAlgorithm());
      } catch ( java.security.NoSuchAlgorithmException e ) {
                 // java.security.NoSuchProviderException e ) {
        getLogger().error(e);
        throw new RuntimeException(e.getMessage(), e);
      }
      `
    },
    {
      name: 'update',
      args: [
        {
          name: 'message',
          type: 'String'
        }
      ],
      javaCode: `
      java.security.MessageDigest md = (java.security.MessageDigest) getMd();
       md.update(message.getBytes(StandardCharsets.UTF_8));
      `
    },
    {
      name: 'roll',
      javaCode: `
      java.security.MessageDigest md = (java.security.MessageDigest) getMd();
      byte[] digest = md.digest();
      if ( getRollDigests() &&
           getPreviousDigest() != null ) {
        md.update((byte[]) getPreviousDigest());
        md.update(digest);
        digest = md.digest();
      }
      setDigest(Hex.toHexString(digest));
      setPreviousDigest(digest);
      `
    },
    {
      name: 'verify',
      args: [
        {
          name: 'message',
          type: 'String'
        },
        {
          name: 'messageDigest',
          type: 'net.nanopay.security.MessageDigest'
        }
      ],
      type: 'byte[]',
      throws: ['RuntimeException'],
      javaCode: `
      java.security.MessageDigest md = (java.security.MessageDigest) instance();
      md.update(message.getBytes(StandardCharsets.UTF_8));
      byte[] digest = md.digest();
      if ( getRollDigests() &&
           getPreviousDigest() != null ) {
        md.update((byte[]) getPreviousDigest());
        md.update(digest);
        digest = md.digest();
      }
      if ( ! Hex.toHexString(digest).equals(messageDigest.getDigest()) ) {
        getLogger().error("Digest verification failed.", messageDigest.getDigest(), Hex.toHexString(digest));
        throw new RuntimeException("Digest verification failed.");
      }
      return digest;
      `
    },
    {
      name: 'reset',
      documentation: 'Reset hashing chain, used for journal reset.',
      javaCode: `
      resetMessageDigest();
      setDigest(null);
      setPreviousDigest(null);
      `
    },
    {
      name: 'resetMessageDigest',
      documentation: 'Reset internal hash, used for outputter string builder reset.',
      javaCode: '((java.security.MessageDigest) getMd()).reset();'
    },
    {
      name: 'setPrevious',
      args: [
        {
          name: 'md',
          type: 'net.nanopay.security.MessageDigest'
        }
      ],
      javaCode: `
      String digest = md.getDigest();
      if ( ! SafetyUtil.isEmpty(digest) ) {
        setPreviousDigest(Hex.decode(digest));
      } else {
        setPreviousDigest(null);
      }
      `
    }
   ]
});
