foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'TransactionEntity',
  documentation: `This model represents the payer/payee of a transaction and is meant to storage transient.`,

  javaImports: ['foam.nanos.auth.User'],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'firstName',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'lastName',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'EMail',
      name: 'email'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      view: { class: 'foam.nanos.auth.ProfilePictureView' }
    }
  ],
  axioms: [
    {
      writeToSwiftClass: function(cls) {
        cls.method(foam.swift.Method.create({
          static: true,
          name: 'fromUser',
          returnType: net.nanopay.tx.model.TransactionEntity.model_.swiftName,
          args: [
            foam.swift.Argument.create({
              type: foam.nanos.auth.User.model_.swiftName,
              localName: 'u',
            }),
            foam.swift.Argument.create({
              type: 'Context',
              externalName: 'x',
              localName: 'x',
              defaultValue: 'Context.GLOBAL',
            })
          ],
          body: `
            let t = x.create(net_nanopay_tx_model_TransactionEntity.self)!
            t.copyFrom(u)
            return t
          `
        }))
      },
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public TransactionEntity(User user) {
            setId(user.getId());
            setFirstName(user.getFirstName());
            setLastName(user.getLastName());
            setEmail(user.getEmail());
            setProfilePicture(user.getProfilePicture());
          }
        `);
      },
    },
  ],
});
