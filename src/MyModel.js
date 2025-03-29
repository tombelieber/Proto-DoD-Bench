/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const MyModel = $root.MyModel = (() => {

    /**
     * Properties of a MyModel.
     * @exports IMyModel
     * @interface IMyModel
     * @property {number|null} [id] MyModel id
     * @property {number|null} [value] MyModel value
     */

    /**
     * Constructs a new MyModel.
     * @exports MyModel
     * @classdesc Represents a MyModel.
     * @implements IMyModel
     * @constructor
     * @param {IMyModel=} [properties] Properties to set
     */
    function MyModel(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * MyModel id.
     * @member {number} id
     * @memberof MyModel
     * @instance
     */
    MyModel.prototype.id = 0;

    /**
     * MyModel value.
     * @member {number} value
     * @memberof MyModel
     * @instance
     */
    MyModel.prototype.value = 0;

    /**
     * Creates a new MyModel instance using the specified properties.
     * @function create
     * @memberof MyModel
     * @static
     * @param {IMyModel=} [properties] Properties to set
     * @returns {MyModel} MyModel instance
     */
    MyModel.create = function create(properties) {
        return new MyModel(properties);
    };

    /**
     * Encodes the specified MyModel message. Does not implicitly {@link MyModel.verify|verify} messages.
     * @function encode
     * @memberof MyModel
     * @static
     * @param {IMyModel} message MyModel message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MyModel.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.id != null && Object.hasOwnProperty.call(message, "id"))
            writer.uint32(/* id 1, wireType 5 =*/13).fixed32(message.id);
        if (message.value != null && Object.hasOwnProperty.call(message, "value"))
            writer.uint32(/* id 2, wireType 1 =*/17).double(message.value);
        return writer;
    };

    /**
     * Encodes the specified MyModel message, length delimited. Does not implicitly {@link MyModel.verify|verify} messages.
     * @function encodeDelimited
     * @memberof MyModel
     * @static
     * @param {IMyModel} message MyModel message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    MyModel.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a MyModel message from the specified reader or buffer.
     * @function decode
     * @memberof MyModel
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {MyModel} MyModel
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MyModel.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.MyModel();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.id = reader.fixed32();
                    break;
                }
            case 2: {
                    message.value = reader.double();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a MyModel message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof MyModel
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {MyModel} MyModel
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    MyModel.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a MyModel message.
     * @function verify
     * @memberof MyModel
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    MyModel.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.id != null && message.hasOwnProperty("id"))
            if (!$util.isInteger(message.id))
                return "id: integer expected";
        if (message.value != null && message.hasOwnProperty("value"))
            if (typeof message.value !== "number")
                return "value: number expected";
        return null;
    };

    /**
     * Creates a MyModel message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof MyModel
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {MyModel} MyModel
     */
    MyModel.fromObject = function fromObject(object) {
        if (object instanceof $root.MyModel)
            return object;
        let message = new $root.MyModel();
        if (object.id != null)
            message.id = object.id >>> 0;
        if (object.value != null)
            message.value = Number(object.value);
        return message;
    };

    /**
     * Creates a plain object from a MyModel message. Also converts values to other types if specified.
     * @function toObject
     * @memberof MyModel
     * @static
     * @param {MyModel} message MyModel
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    MyModel.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.id = 0;
            object.value = 0;
        }
        if (message.id != null && message.hasOwnProperty("id"))
            object.id = message.id;
        if (message.value != null && message.hasOwnProperty("value"))
            object.value = options.json && !isFinite(message.value) ? String(message.value) : message.value;
        return object;
    };

    /**
     * Converts this MyModel to JSON.
     * @function toJSON
     * @memberof MyModel
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    MyModel.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for MyModel
     * @function getTypeUrl
     * @memberof MyModel
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    MyModel.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/MyModel";
    };

    return MyModel;
})();

export { $root as default };
