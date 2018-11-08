<h1>Security Quickstart Guide</h1>

<h2>Table of Contents</h2>

* [Purpose](#purpose)
   * [Glossary](#glossary)
   * [EncryptingDAO](#encryptingdao)
   * [HashingJDAO](#hashingjdao)
   * [HashingJournal](#hashingjournal)
   * [HashingOutputter](#hashingoutputter)
   * [HashingWriter](#hashingwriter)
   * [KeyPairDAO](#keypairdao)
   * [KeyStoreManager](#keystoremanager)
      * [Methods](#methods)
      * [Implementations](#implementations)
         * [BKSKeyStoreManager](#bkskeystoremanager)
         * [JCEKSKeyStoreManager](#jcekskeystoremanager)
         * [JKSKeyStoreManager](#jkskeystoremanager)
         * [PKCS11KeyStoreManager](#pkcs11keystoremanager)
         * [PKCS12KeyStoreManager](#pkcs12keystoremanager)
   * [MerkleTree](#merkletree)
   * [MerkleTreeHelper](#merkletreehelper)
   * [PayerAssentTransactionDAO](#payerassenttransactiondao)
   * [PrivateKeyDAO](#privatekeydao)
   * [PublicKeyDAO](#publickeydao)
   * [RandomNonceDAO](#randomnoncedao)
   * [UserKeyPairGenerationDAO](#userkeypairgenerationdao)

## Purpose
The purpose of this quickstart guide is to educate developers as to the setup & usage of the various classes within the security package of the nanopay platform as well as briefly cover a few security/cryptographic terms.

## Glossary
<dl>
	<dt>Hardware Security Module</dt>
	<dd>A physical computing device that safeguards and manages digital keys for strong authentication and provides cryptoprocessing.</dd>
	<dt>KeyStore</dt>
	<dd>A storage facility for cryptographic keys and certificates</dd>
	<dt>Merkle Tree</dt>
	<dd>A tree in which every leaf node is labeled with the hash of a data block and every non-leaf node is labelled with the cryptographic hash of the label of its child nodes.</dd>
	<dt>Message Digest</dt>
	<dd>The output of a cryptographic has function. Sometimes called the hash value, hash, or simply digest.</dd>
	<dt>PKCS #11</dt>
	<dd>A platform independent API to interact with cryptographic tokens, such as ones contained on an HSM or a smart card.</dd>
	<dt>PKCS #12</dt>
	<dd>An archive file format for storing many cryptographic objects as a single file.</dd>
	<dt>Provider</dt>
	<dd>A "provider" for the Java Security API, where a provider implements some or all parts of Java Security.&nbsp;Services that a provider may implement include:
	<ul>
		<li>Algorithms (such as DSA, RSA, is MD5 or SHA-1).</li>
		<li>Key generation, conversion, and management facilities (such as for algorithm-specific keys).</li>
	</ul>
	</dd>
</dl>

## EncryptingDAO

### Overview

The EncryptingDAO is a DAO that adapts all objects to/from an EncryptedObject class. The original input data is converted to a JSON string and that string is encrypted and wrapped in an EncryptedObject. When objects are selected from the DAO, the data is decrypted to its original form. By default, the EncryptingDAO uses a 256 bit AES key which is fetched from the system's KeyStoreManager or newly generated if a key does not exist. The alias of the key should be the class name of the Object being stored in the DAO. For example, if one is storing User's, the alias would be "foam.nanos.auth.User".

### Usage

The EncryptingDAO is a ProxyDAO; all that is required is a delegate. By default, the DAO uses a 256 bit AES key and encrypts using AES/GCM/NoPadding as the Cipher algorithm.

```
// set up delegate
foam.core.X x = foam.core.EmptyX.instance();
foam.core.ClassInfo of = foam.nanos.auth.User.getOwnClassInfo();
foam.dao.DAO delegate = new foam.dao.MDAO(of);

// usage with default settings
new net.nanopay.security.EncryptingDAO(x, of, delegate);

// TODO: allow more customization, model class
```

## HashingJDAO

TODO

## HashingJournal

TODO

## HashingOutputter

TODO

## HashingWriter

### Overview

HashingWriter is a decorator for a Writer that hashes any data that is appended to it. Its primary use is to avoid having to process data more than once. A developer could use HashingWriter to write out to a file once and then calculate the hash after it is finished writing. It is used in the HashingOutputter to calculate the hashes of outgoing data.

### Usage

The HashingWriter is a decorator for a Writer; it requires a Writer delegate and an optional hashing algorithm. SHA-256 is the default hashing algorithm.
```
// create hashing writer with default algorithm of SHA-256
new net.nanopay.security.HashingWriter(new java.io.StringWriter());

// create hashing writer with SHA-1
new net.nanopay.security.HashingWriter("SHA-1", new java.io.StringWriter());

```

## KeyPairDAO

### Overview

KeyPairDAO is used to store KeyPairEntry objects into the DAO. On put, it routes the KeyPair's Public Key and Private Key to the PublicKeyDAO and PrivateKeyDAO respectively where they are stored. 

### Usage

The KeyPairDAO extends the ProxyDAO; all that is required is a delegate.

```
// set up delegate
foam.core.X x = foam.core.EmptyX.instance();
foam.core.ClassInfo of = net.nanopay.security.KeyPairEntry.getOwnClassInfo();
foam.dao.DAO delegate = new foam.dao.MDAO(of);

new net.nanopay.security.KeyPairDAO.Builder(x)
  .setDelegate(delegate)
  .build();
```

## KeyStoreManager

### Overview

KeyStoreManager is an interface that aims to help abstract an underlying [KeyStore](https://docs.oracle.com/javase/8/docs/api/java/security/KeyStore.html). By providing a common interface, developers can develop various implementations that may use a combination of software or hardware cryptography.

### Methods

<dl>
	<dt>getKeyStore</dt>
	<dd>Returns the KeyStore associated with the KeyStoreManager implementation.</dd>
	<dt>unlock</dt>
	<dd>Unlocks the KeyStore. Efforts should be made to ensure that this method is only called once.</dd>
	<dt>loadKey</dt>
	<dd>Loads a key from the KeyStore.</dd>
	<dt>loadKey_</dt>
	<dd>Loads a key from the KeyStore using an additional protection parameter.</dd>
	<dt>storeKey</dt>
	<dd>Stores a key into the KeyStore</dd>
	<dt>storeKey_</dt>
	<dd>Stores a key into the KeyStore using an additional protection parameter.</dd>
</dl>

### Implementations

#### BKSKeyStoreManager

##### Overview

An implementation of AbstractFileKeyStoreManager that uses BouncyCastle as the KeyStore provider.

#### JCEKSKeyStoreManager

##### Overview

An implementation of AbstractFileKeyStoreManager that uses SunJCE as the KeyStore provider. If objects in the Java Cryptographic Extension are not required then please use the JKSKeyStoreManager.

#### JKSKeyStoreManager

##### Overview

An implementation of AbstractFileKeyStoreManager that uses SUN as the KeyStore provider. If objects in the Java Cryptographic Extension are required then please use the JCEKSKeyStoreManager.

#### PKCS11KeyStoreManager

##### Overview

An implementation of AbstractKeyStoreManager that makes use of PKCS #11 as the KeyStore type. A configuration file is required to use this KeyStoreManager. The format of the configuration is dependent on the underlying PKCS #11 library implementation. Most HSM providers offer some form of PKCS #11 library that can be used by this KeyStoreManager.

#### PKCS12KeyStoreManager

##### Overview

An implementation of AbstractFileKeyStoreManager that uses PKCS #12 as the KeyStore type. This implementation is the preferred method of storing cryptographic objects to an archive file format as it is language-agnostic and has greater support overall.

## MerkleTree

TODO

### Overview

### Usage

## MerkleTreeHelper

TODO

### Overview

### Usage

## PayerAssentTransactionDAO

TODO

### Overview

### Usage

## PrivateKeyDAO

### Overview

The PrivateKeyDAO is a DAO which stores PrivateKeyEntry objects. Before storing in the DAO, the private key is wrapped using an encrypting key. This ensures that the Private Keys are never stored in a DAO unencrypted.

### Usage

The PrivateKeyDAO extends ProxyDAO; a delegate is required. The only additional property that is required to be configured is the `alias` property. This property is used in conjunction with the KeyStoreManager interface to load/store the wrapping key. By default, the PrivateKeyDAO uses a 256 bit AES key to wrap all PrivateKeys.

```
// set up delegate
foam.core.X x = foam.core.EmptyX.instance();
foam.core.ClassInfo of = net.nanopay.security.PrivateKeyEntry.getOwnClassInfo();
foam.dao.DAO delegate = new foam.dao.MDAO(of);

// set up PrivateKeyDAO using default properties
new net.nanopay.security.PrivateKeyDAO.Builder(x)
  .setAlias("PrivateKeyDAOExample")
  .build();

// set up PrivateKeyDAO setting all properties
new net.nanopay.security.PrivateKeyDAO.Builder(x)
  .setAlias("PrivateKeyDAOExample")
  .setAlgorithm("AES")
  .setKeySize(128)
  .build();
```

## PublicKeyDAO

### Overview

The PublicKeyDAO is a DAO which stores PublicKeyEntry objects. Before storing in the DAO, the public key is Base64 encoded.

### Usage

The PublicKeyDAO extends ProxyDAO; all that is required is a delegate.

```
// set up delegate
foam.core.X x = foam.core.EmptyX.instance();
foam.core.ClassInfo of = net.nanopay.security.PublicKeyEntry.getOwnClassInfo();
foam.dao.DAO delegate = new foam.dao.MDAO(of);

new net.nanopay.security.PublicKeyDAO.Builder(x)
  .setDelegate(delegate)
  .build();
```

## RandomNonceDAO

### Overview

The RandomNonceDAO is a DAO that will randomly generate 128 bits to use as an ID for any FObject's that do not have their ID property set. This DAO can be configured to set other properties besides the ID property and doing so would allow a developer to introduce randomness in to any FObject being stored into the DAO. 

### Usage

The RandomNonceDAO extends ProxyDAO; all that is required is a delegate. By default, the property that is set with random bits is the `id` property.

```
// set up delegate
foam.core.X x = foam.core.EmptyX.instance();
foam.core.ClassInfo of = foam.nanos.auth.User.getOwnClassInfo();
foam.dao.DAO delegate = new foam.dao.MDAO(of);

// usage with default settings
new net.nanopay.security.RandomNonceDAO.Builder(x)
  .setDelegate(delegate)
  .build();

// usage with a different property
new net.nanopay.security.RandomNonceDAO.Builder(x)
  .setProperty("otherProp")
  .setDelegate(delegate)
  .build();

```

## UserKeyPairGenerationDAO

TODO

### Overview



### Usage