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
  package: 'net.nanopay.flinks.model',
  name: 'SecurityChallengeModel',

  documentation: 'model for Flinks Security Challenges',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
        protected static final java.util.Set<String> SUPPORTED_TYPES = (java.util.Set<String>) java.util.Collections.unmodifiableSet(foam.util.Arrays.asSet(new String[] {
          "QuestionAndAnswer",
          "MultipleChoice",
          "MultipleChoiceMultipleAnswers",
          "ImageSelection",
          "TextOrCall"
        }));
        `);
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'Type'
    },
    {
      class: 'String',
      name: 'Prompt'
    },
    {
      class: 'StringArray',
      name: 'Iterables'
    }
  ],

  methods: [
    {
      name: 'validate',
      type: 'Void',
      javaThrows: [ 'java.lang.Exception' ],
      javaCode: `
        String type = getType();
        if ( ! SUPPORTED_TYPES.contains(type) ) {
          throw new java.lang.Exception("Unsupported security challenge type: " + type);
        }
      `
    }
  ]
});
