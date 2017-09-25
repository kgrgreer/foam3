// GENERATED CODE. DO NOT MODIFY BY HAND.
public protocol BoxRegistryInterface {
    func `doLookup`(_ name: String) throws -> Box
    func `register`(_ name: String, _ service: BoxService?, _ localBox: Box) -> Box
    func `unregister`(_ name: String)
}