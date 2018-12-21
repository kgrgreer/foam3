# XSD to FOAM

### Overview

Through the use of scripts, we have the ability to parse XSD schema files to generate FOAM models. This greatly reduces the pain of having to model each message by hand which would otherwise be a very tedious property.
The scripts are also able to add any property level validation that may be contained in the schema.

### Dependencies

The XSD parser & model generator script use node.js and require the following packages:
<ul>
	<li>json-stringify-pretty-compact: ^1.0.4</li>
	<li>mkdir: ^0.5.1</li>
	<li>underscore: ^1.8.3</li>
	<li>xmldom : ^0.1.27</li>
</ul>

### Usage

To generate FOAM models from an XSD file by invoking the following command in the top level project directory (NANOPAY/):

```
node tools/xsd/index.js <package> <files>...
```

It will look for XSD files in the following directory. Providing a fully qualified path will not work.

```
NANOPAY/tools/xsd/messages
```

Two additional files are created as a byproduct of the script:
<ul>
	<li><b>classes.js</b>: allows for seamless integration into our Java code generation scripts.</li>
	<li><b>files.js</b>: allows us to use the model on the web client.</li>
</ul>

**Example**

```
node tools/xsd/index.js net.nanopay.iso20022 \
	pacs.002.001.09.xsd \
	pacs.008.001.06.xsd \
	pacs.028.001.01.xsd \
	pain.007.001.07.xsd \
	tsin.004.001.01.xsd

```

The above script will generate all of the models (as well as classes.js and files.js) in the following directory:
```
NANOPAY/nanopay/src/net/nanopay/iso20022
```

### Namespaces

The script is currently only able to parse XSD files that use the namespace `xs`. For example:

```
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
	<xs:element name="Test" type="xs:string"/>
</xs:schema>
```

An XSD file using any other namespace (for example `xsd`) must be modified to use `xs` for the parser to work.

### Parsing WSDL files

While the scripts themselves are not able to parse WSDL files directly, we can extract XSD files from the file to be able to more easily generate models. As outlined [here](https://www.w3schools.com/xml/xml_wsdl.asp), WSDL files contain a type section. This type section defines an XSD schema which, if extracted into a separate file, can be used to generate all the models required.

