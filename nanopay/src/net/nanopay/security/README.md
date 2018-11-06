<h1>Security Quickstart Guide</h1>

<h2>Table of Contents</h2>

   * [Purpose](#purpose)
   * [Glossary](#glossary)
   * [KeyStoreManager](#keystoremanager)
       * [Description](#description)
       * [Methods](#methods)
       * [Implementations](#implementations)
         * [AbstractKeyStoreManager](#abstractkeystoremanager)
         * [AbstractFileKeyStoreManager](#abstractfilekeystoremanager)
         * [BKSKeyStoreManager](#bkskeystoremanager)
         * [JCEKSKeyStoreManager](#jcekskeystoremanager)
         * [JKSKeyStoreManager](#jkskeystoremanager)
         * [PKCS11KeyStoreManager](#pkcs11keystoremanager)
         * [PKCS12KeyStoreManager](#pkcs12keystoremanager)

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

## KeyStoreManager

### Description

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

The following implementations are available:

#### AbstractKeyStoreManager

Abstract implementation that only implements the following methods: ***loadKey***, ***loadKey_***, ***storeKey***, ***storeKey_***. Implementations extending this abstract class are required to implement the ***getKeyStore*** and ***unlock**** methods.

#### AbstractFileKeyStoreManager

Abstract implementation that uses an archive file format to store cryptographic objects. Implementations of this abstract class must provide a KeyStore type, a Provider for the KeyStore (optional), the KeyStore file location, and the KeyStore's passphrase file location. The KeyStore is unlocked using the passphrase stored in the KeyStore passphrase file. All keys are protected using the same passphrase used to unlock the KeyStore.

#### BKSKeyStoreManager

An implementation of AbstractFileKeyStoreManager that uses BouncyCastle as the KeyStore provider.

#### JCEKSKeyStoreManager

An implementation of AbstractFileKeyStoreManager that uses SunJCE as the KeyStore provider. If objects in the Java Cryptographic Extension are not required then please use the JKSKeyStoreManager.

#### JKSKeyStoreManager

An implementation of AbstractFileKeyStoreManager that uses SUN as the KeyStore provider. If objects in the Java Cryptographic Extension are required then please use the JCEKSKeyStoreManager.

#### PKCS11KeyStoreManager

An implementation of AbstractKeyStoreManager that makes use of PKCS #11 as the KeyStore type. A configuration file is required to use this KeyStoreManager. The format of the configuration is dependent on the underlying PKCS #11 library implementation. Most HSM providers offer some form of PKCS #11 library that can be used by this KeyStoreManager.

#### PKCS12KeyStoreManager

An implementation of AbstractFileKeyStoreManager that uses PKCS #12 as the KeyStore type. This implementation is the preferred method of storing cryptographic objects to an archive file format as it is language-agnostic and has greater support overall.



