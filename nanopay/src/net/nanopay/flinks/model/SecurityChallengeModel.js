foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'SecurityChallengeModel',

  documentation: 'model for Flinks Security Challenges',

  constants: [
    {
      javaType: 'java.util.HashSet<String>',
      name: 'SUPPORTED_TYPES',
      javaValue: `new java.util.HashSet() {{
        add("QuestionAndAnswer");
        add("MultipleChoice");
        add("MultipleChoiceMultipleAnswers");
        add("ImageSelection");
        add("TextOrCall");
      }};`
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
        if (!SUPPORTED_TYPES.contains(type)) {
          throw new java.lang.Exception("Unsupported security challenge type: " + type);
        }
      `
    }
  ]
});
