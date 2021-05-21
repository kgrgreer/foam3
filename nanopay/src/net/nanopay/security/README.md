<h1>Security Quickstart Guide</h1>

<h2>Table of Contents</h2>

* [Purpose](#purpose)
* [Glossary](#glossary)
* [EncryptingDAO](#encryptingdao)
	* [Overview](#overview)
	* [Usage](#usage)
* [HashingJDAO](#hashingjdao)
	* [Overview](#overview-1)
	* [Usage](#usage-1)
* [HashingJournal](#hashingjournal)
	* [Overview](#overview-2)
	* [Usage](#usage-2)
* [HashingOutputter](#hashingoutputter)
	* [Overview](#overview-3)
	* [Usage](#usage-3)
* [KeyPairDAO](#keypairdao)
	* [Overview](#overview-5)
	* [Usage](#usage-5)
* [KeyStoreManager](#keystoremanager)
	* [Overview](#overview-6)
	* [Methods](#methods)
	* [Implementations](#implementations)
		* [BKSKeyStoreManager](#bkskeystoremanager)
			* [Overview](#overview-7)
		* [JCEKSKeyStoreManager](#jcekskeystoremanager)
			* [Overview](#overview-8)
		* [JKSKeyStoreManager](#jkskeystoremanager)
			* [Overview](#overview-9)
		* [PKCS11KeyStoreManager](#pkcs11keystoremanager)
			* [Overview](#overview-10)
		* [PKCS12KeyStoreManager](#pkcs12keystoremanager)
			* [Overview](#overview-11)
* [MerkleTree](#merkletree)
	* [Overview](#overview-12)
	* [Methods](#methods-1)
	* [Usage](#usage-6)
* [MerkleTreeHelper](#merkletreehelper)
	* [Overview](#overview-13)
	* [Methods](#methods-2)
	* [Usage](#usage-7)
* [PayerAssentTransactionDAO](#payerassenttransactiondao)
	* [Overview](#overview-14)
	* [Usage](#usage-8)
* [PrivateKeyDAO](#privatekeydao)
	* [Overview](#overview-15)
	* [Usage](#usage-9)
* [PublicKeyDAO](#publickeydao)
	* [Overview](#overview-16)
	* [Usage](#usage-10)
* [RandomNonceDAO](#randomnoncedao)
	* [Overview](#overview-17)
	* [Usage](#usage-11)
* [UserKeyPairGenerationDAO](#userkeypairgenerationdao)
	* [Overview](#overview-18)
	* [Usage](#usage-12)

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
	<dd>The output of a cryptographic hash function. Sometimes called the hash value, hash, or simply digest.</dd>
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

EncryptingDAO is a DAO that adapts all objects to/from an EncryptedObject class. The original input data is converted to a JSON string and that string is encrypted and wrapped in an EncryptedObject. When objects are selected from the DAO, the data is decrypted to its original form. By default, the EncryptingDAO uses a 256 bit AES key which is fetched from the system's KeyStoreManager or newly generated if a key does not exist. The alias of the key should be the class name of the Object being stored in the DAO. For example, if one is storing User's, the alias would be "foam.nanos.auth.User".

### Usage

EncryptingDAO is a ProxyDAO; all that is required is a delegate. By default, the DAO uses a 256 bit AES key and encrypts using AES/GCM/NoPadding as the Cipher algorithm.

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

### Overview

HashingJDAO is an extension of the JDAO that makes use of the HashingJournal as opposed to the normal FileJournal. The use of this DAO will add message digests to the end of every entry in the Journal. On startup, the message digests will be verified against the original data to ensure that the original data has not been tampered with. It can be configured so that every entry must contain a message digest and it can also be configured to perform hash chaining.

### Usage

HashingJDAO is a ProxyDAO; a delegate is required. A journal filename is required. Optionally, a developer may specify the following parameters: the hashing algorithm (SHA-256 by default), flag to enable hash chaining (disabled by default), flag to require digests on every entry (disabled by default).

```
// set up delegate
foam.core.X x = foam.core.EmptyX.instance();
foam.core.ClassInfo of = net.nanopay.security.PublicKeyEntry.getOwnClassInfo();
foam.dao.DAO delegate = new foam.dao.MDAO(of);

// set up with default parameters
new net.nanopay.security.HashingJDAO(x, delegate, "users.jrl");

// set up with all parameters set
new net.nanopay.security.HashingJDAO(x, "SHA-1", true, true, delegate, "users.jrl");
```

## HashingJournal

### Overview

HashingJournal is a journal implementation that appends every journal record with a hash of that entry. On journal replay, the HashingJournal will verify the entry agains the message digest to ensure that the record has not been tampered with. The HashingJournal has the ability to chain message digests together effectively creating a hash chain. By default, the hashing algorithm used is SHA-256.

### Usage

HashingJournal extends FileJournal; it requires a MessageDigest which is in turn used to by the formatter (outputter) and parser. Optionally, the flag to require digests when parsing, and the flag to chain digests (rollDigests) may be specified on the MessageDigest.

```
// set up hashing journal with default values
foam.core.X x = foam.core.EmptyX.instance();
new net.nanopay.security.HashingJournal.Builder(x)
  .setFilename("hashingjournal")
  .build();

// set up hashing journal setting optional parameters
new net.nanopay.security.HashingJournal.Builder(x)
  .setFilename("hashingjournal")
  .setDigestRequired(false)
  .setQuoteKeys(true)
  .setMessageDigest(new net.nanopay.security.MessageDigest.Builder(x)
    .setAlgorithm("SHA-512")
    .setRollDigests(true)
    .build())
  .build();
```

## HashingOutputter

### Overview

HashingOutputter is an extension on the JSON Outputter that appends a MessageDigest to the end of the output. It uses the MessageDigest class to calculate the digest of the data being appended. The HashingOutputter has the ability to create a hash chain by prepending the previous digest to the new digest before outputting. The HashingOutputter overrides FObjectFormatter.append to intercept and update the digest with pending journal updates.  The MessageDigest enables chaining with rollDigests is true.

### Usage

HashingOutputter requires a MessageDigest for usage. To enable hash chaining, one must set `rollDigest` to true in the MessageDigest.

```
// set up hashing journal
foam.core.X x = foam.core.EmptyX.instance();
net.nanopay.security.HashingJournal journal = new net.nanopay.security.HashingJournal.Builder(x)
  .setMessageDigest(new net.nanopay.security.MessageDigest.Builder(x)
    .setAlgorithm("SHA-512")
    .setRollDigests(true)
    .build())
  .build();

// set up hashing outputter
net.nanopay.security.HashingOutputter outputter = net.nanopay.security.HashingOutputter(x, true /*quoteKeys*/, new net.nanopay.security.MessageDigest.Builder(x)
    .setAlgorithm("SHA-512")
    .setRollDigests(true)
    .build());
foam.nanos.auth.User user = new foam.nanos.auth.User.Builder(x).setId(1000).build();
System.out.println(outputter.stringify(user));

// should output the following
// {"class":"foam.nanos.auth.User","id":1000},{algorithm:"SHA-256",provider:"", digest:"9eea141b3f4646d2e59ee5b87c93ce43fb26954a5b699b8ccc813bd1e9bf5363"}

```

## KeyPairDAO

### Overview

KeyPairDAO is used to store KeyPairEntry objects into the DAO. On put, it routes the KeyPair's Public Key and Private Key to the PublicKeyDAO and PrivateKeyDAO respectively where they are stored.

### Usage

KeyPairDAO extends the ProxyDAO; a delegate is required.

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

### Overview

MerkleTree is a class that aids in the building of a Merkle tree. By default, it builds a Merkle tree using a hashing algorithm of SHA-256.

### Methods

<dl>
	<dt>addHash</dt>
	<dd>This method appends a new hash to the list of hashes that need to be built into a Merkle tree.</dd>
	<dt>buildTree</dt>
	<dd>This method builds the Merkle tree from the data that was already being pushed to the object. Once the tree is built, the state of the object is cleared.</dd>
</dl>

### Usage

```
// MerkleTree with default algorithm
net.nanopay.security.MerkleTree builder = new net.nanopay.security.MerkleTree();

// add hash to tree
builder.addHash(new byte[] { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 });

// build tree
byte[][] tree = builder.buildTree();
```

## MerkleTreeHelper

### Overview

This class is a utility class for encapsulating operators on the Merkle Tree.

### Methods

<dl>
	<dt>setPath</dt>
	<dd>Provided: a tree, a hash, and a receipt, this method finds the hash in the tree and returns the relevant hashes in the tree that when combined with the provided hash would result in the top hash for the tree. The list of hashes (path) is the list of hashes whose index is closes to the node of interest. Hence, in order to compute the top hash for the tree, one would have to simply combine and append the hashes in the order provided. The direction of the hash combination can be computed from the dataIndex value stored in the receipt.</dd>
	<dt>findHashIndex</dt>
	<dd>This methods finds and return the index of the hash in the tree provided. If the hash isn't found, then a value of -1 is returned.</dd>
	<dt>logBase2</dt>
	<dd>Calculates log base 2</dd>
	<dt>getSibling</dt>
	<dd>This method returns the index of the immediate sibling for the given node index.</dd>
</dl>

### Usage

```
// hash to add
byte[] hash = new byte[] { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 }

// MerkleTree with default algorithm
foam.core.X x = foam.core.EmptyX.instance();
net.nanopay.security.MerkleTree builder = new net.nanopay.security.MerkleTree();

// add hash to tree
builder.addHash(hash);

// build tree
byte[][] tree = builder.buildTree();

// create dummy receipt object
net.nanopay.security.receipt.Receipt receipt = new net.nanopay.security.receipt.Receipt.Builder(x).build();

// set path to node
net.nanopay.security.MerkleTreeHelper.setPath(tree, hash, receipt);
```

## PayerAssentTransactionDAO

### Overview

PayerAssentTransactionDAO is a DAO in which adds a payer's signature to any incoming transactions. The transaction is signed using the Payer's private key and the signature can be verified using their public key. The DAO verifies that the transaction has not already been signed by the payer. By default, the signing algorithm used is SHA256withRSA.

### Usage

PayerAssentTransactionDAO extends ProxyDAO; a delegate is required. Optionally, the signing algorithm may be specified.

```
// set up delegate
foam.core.X x = foam.core.EmptyX.instance();
foam.core.ClassInfo of = net.nanopay.tx.model.Transaction.getOwnClassInfo();
foam.dao.DAO delegate = new foam.dao.MDAO(of);

// set up PayerAssentTransactionDAO using default properties
new net.nanopay.security.PayerAssentTransactionDAO.Builder(x)
  .setDelegate(delegate)
  .build();

// set up PayerAssentTransactionDAO setting algorithm
new net.nanopay.security.PayerAssentTransactionDAO.Builder(x)
  .setAlgorithm("SHA256withECDSA")
  .setDelegate(delegate)
  .build();
```

## PrivateKeyDAO

### Overview

PrivateKeyDAO is a DAO which stores PrivateKeyEntry objects. Before storing in the DAO, the private key is wrapped using an encrypting key. This ensures that the Private Keys are never stored in a DAO unencrypted.

### Usage

PrivateKeyDAO extends ProxyDAO; a delegate is required. The only additional property that is required to be configured is the `alias` property. This property is used in conjunction with the KeyStoreManager interface to load/store the wrapping key. By default, the PrivateKeyDAO uses a 256 bit AES key to wrap all PrivateKeys.

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

PublicKeyDAO is a DAO which stores PublicKeyEntry objects. Before storing in the DAO, the public key is Base64 encoded.

### Usage

PublicKeyDAO extends ProxyDAO; a delegate is required.

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

RandomNonceDAO is a DAO that will randomly generate 128 bits to use as an ID for any FObject's that do not have their ID property set. This DAO can be configured to set other properties besides the ID property and doing so would allow a developer to introduce randomness in to any FObject being stored into the DAO.

### Usage

RandomNonceDAO extends ProxyDAO; a delegate is required. By default, the property that is set with random bits is the `id` property.

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

### Overview

UserKeyPairGeneration is a DAO that will generate a new key pair entry for any new user being put into the DAO as well as any existing users who may not have a key pair. By default the UserKeyPairGenerationDAO will generate a 4096 bit RSA key pair. This key pair is then stored in the KeyPairDAO where the private key will be encrypted before being stored.

### Usage

UserKeyPairGeneration extends ProxyDAO; a delegate is required. Optionally, the algorithm and key size may be specified.

```
// set up delegate
foam.core.X x = foam.core.EmptyX.instance();
foam.core.ClassInfo of = foam.nanos.auth.User.getOwnClassInfo();
foam.dao.DAO delegate = new foam.dao.MDAO(of);

// set up user key pair generation dao with default settings
new net.nanopay.security.UserKeyPairGenerationDAO.Builder(x)
  .setDelegate(delegate)
  .build();

// set up user key pair generation dao with modified settings
new net.nanopay.security.UserKeyPairGenerationDAO.Builder(x)
  .setAlgorithm("EC")
  .setKeySize(256)
  .setDelegate(delegate)
  .build();
```
