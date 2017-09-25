// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class KeyParser: ProxyParser {

  public var key: String {
    get {
      
if _key_inited_ {
  return _key_!
}

return ""

      
    }
set(value) {
      
self.set(key: "key", value: value)
      
    }
  }

  var _key_: String! = nil

  var _key_inited_: Bool = false

  public static let KEY: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "key"
  let classInfo: ClassInfo
  let transient = false
  let label = "Key" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var key_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "key",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var key_Value_Sub_: Subscription?

  public var key$: Slot {
    get {
      return self.key_Value_
    }
set(value) {
      
self.key_Value_Sub_?.detach()
self.key_Value_Sub_ = self.key$.linkFrom(value)
self.onDetach(self.key_Value_Sub_!)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_key_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_key_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_key_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
// TODO use expression.
self.delegate = Alt(["parsers": [
  Literal(["string": "\"" + newValue + "\""]),
  Literal(["string": newValue]),
]])
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return KeyParser.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return KeyParser.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "key":
    _key_inited_ = false
    _key_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "key"]) {
      _ = pub(["propertyChange", "key", key$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "key": return `_key_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "key": return `key`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "key": return `key$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "key$":
    key$ = value as! Slot
    return
  case "key":
  
    let oldValue: Any? = _key_inited_ ? self.`key` : nil
    _key_ = _key_preSet_(oldValue, _key_adapt_(oldValue, value))
    _key_inited_ = true
    _key_postSet_(oldValue, _key_)
    if hasListeners(["propertyChange", "key"]) && !FOAM_utils.equals(oldValue, _key_) {
      _ = pub(["propertyChange", "key", key$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.json.KeyParser"

    lazy var label: String = "Key Parser"

    lazy var parent: ClassInfo? = ProxyParser.classInfo()

    lazy var ownAxioms: [Axiom] = [KEY]

    lazy var cls: AnyClass = KeyParser.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return KeyParser(args, x)
    }

  }

}