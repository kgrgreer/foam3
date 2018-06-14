foam.CLASS({
  package: 'net.nanopay.security',
  name: 'HashingJournal',
  extends: 'foam.dao.FileJournal',

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.lib.json.JSONParser',
    'foam.util.SafetyUtil',
    'org.bouncycastle.util.encoders.Base64',
    'java.io.BufferedReader'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected byte[] previousHash_ = null;

          public String digest(foam.core.FObject obj) {
            return digest(obj, getAlgorithm());
          }
        `);
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Hashing algorithm to use',
      value: 'SHA-256'
    },
    {
      class: 'Boolean',
      name: 'rollHashes',
      documentation: 'Roll hashes together',
      value: false,
    }
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
        FObject fobj = (FObject) obj;
        super.put(new HashedFObject.Builder(getX())
          .setId(fobj.getProperty("id"))
          .setAlgorithm(getAlgorithm())
          .setDigest(digest(fobj))
          .setValue(fobj)
          .build(), sub);
      `
    },
    {
      name: 'replay',
      javaCode: `
        // count number of lines successfully read
        int successReading = 0;
        JSONParser parser = getX().create(JSONParser.class);

        try ( BufferedReader reader = getReader() ) {
          for ( String line ; ( line = reader.readLine() ) != null ; ) {
            if ( SafetyUtil.isEmpty(line)        ) continue;
            if ( COMMENT.matcher(line).matches() ) continue;

            try {
              char operation = line.charAt(0);
              int length = line.trim().length();
              line = line.trim().substring(2, length - 1);

              HashedFObject hashedObject = (HashedFObject) parser.parseString(line, HashedFObject.class);
              if ( hashedObject == null ) {
                getLogger().error("parse error", getParsingErrorMessage(line), "line:", line);
                continue;
              }

              // verify digest not empty
              String digest = hashedObject.getDigest();
              if ( SafetyUtil.isEmpty(digest) ) {
                // TODO: log, report
                throw new RuntimeException("Digest not found");
              }

              // verify digest
              FObject object = hashedObject.getValue();
              if ( ! digest.equals(digest(object, hashedObject.getAlgorithm())) ) {
                // TODO: log, report
                throw new RuntimeException("Digest verification failed");
              }

              switch ( operation ) {
                case 'p':
                  PropertyInfo id = (PropertyInfo) dao.getOf().getAxiomByName("id");
                  FObject old = dao.find(id.get(object));
                  if ( old != null ) {
                    // merge difference
                    object = mergeFObject(old.fclone(), object);
                  }

                  dao.put(object);
                  break;

                case 'r':
                  dao.remove(object);
                  break;
              }

              successReading++;
            } catch ( Throwable t ) {
              getLogger().error("error replaying journal line:", line, t);
            }
          }
        } catch ( Throwable t) {
          getLogger().error("failed to read from journal", t);
        } finally {
          getLogger().log("Successfully read " + successReading + " entries from file: " + getFilename());
        }
      `
    },
    {
      name: 'digest',
      javaReturns: 'String',
      args: [
        {
          class: 'FObjectProperty',
          name: 'obj'
        },
        {
          class: 'String',
          name: 'algorithm'
        }
      ],
      javaCode: `
        return ! rollHashes_ ?  Base64.toBase64String(obj.hash(algorithm, null)) : rollDigest(obj, algorithm);
      `
    },
    {
      name: 'rollDigest',
      javaReturns: 'String',
      synchronized: true,
      args: [
        {
          class: 'FObjectProperty',
          name: 'obj'
        },
        {
          class: 'String',
          name: 'algorithm'
        }
      ],
      javaCode: `
        previousHash_ = obj.hash(algorithm, previousHash_);
        return Base64.toBase64String(previousHash_);
      `
    }
  ]
});
