// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class MapParser: ProxyParser {

  override public var delegate: Parser {
    get {
      
if _delegate_inited_ {
  return _delegate_!
}

self.set(key: "delegate", value: _delegate_factory_())
return _delegate_!

      
    }
set(value) {
      
self.set(key: "delegate", value: value)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_delegate_factory_`() -> Parser {
    
return 
  Seq1(["index": 2, "parsers": [
    Whitespace(),
    Literal(["string": "{"]),
    Repeat([
      "delegate":
        Seq2(["index1": 1, "index2": 5, "parsers": [
          Whitespace(),
          AnyKeyParser(),
          Whitespace(),
          Literal(["string": ":"]),
          Whitespace(),
          AnyParser(),
        ]]),
      "delim":
        Seq0(["parsers": [
          Whitespace(),
          Literal(["string": ","]),
        ]])
    ]),
    Whitespace(),
    Literal(["string": "}"]),
  ]])
      
  }

  private func `_delegate_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Parser {
    return newValue as! Parser
  }

  private func `_delegate_preSet_`(_ oldValue: Any?, _ newValue: Parser) -> Parser {
    return newValue
  }

  private func `_delegate_postSet_`(_ oldValue: Any?, _ newValue: Parser) {
    
  }

  public override func `parse`(_ ps: PStream, _ x: ParserContext) -> PStream? {
    
let ps = super.parse(ps, x)
if ps != nil {
  let values = ps!.value() as! [Any?]
  var map: [String:Any?] = [:]
  for item in values {
    let item = item as! [Any?]
    map[item[0] as! String] = item[1]
  }
  return ps!.setValue(map)
}
return ps
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return MapParser.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return MapParser.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.json.MapParser"

    lazy var label: String = "Map Parser"

    lazy var parent: ClassInfo? = ProxyParser.classInfo()

    lazy var ownAxioms: [Axiom] = [DELEGATE,PARSE]

    lazy var cls: AnyClass = MapParser.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return MapParser(args, x)
    }

  }

}