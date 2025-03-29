import * as $protobuf from "protobufjs";
import Long = require("long");
/** Properties of a MyModel. */
export interface IMyModel {

    /** MyModel id */
    id?: (number|null);

    /** MyModel value */
    value?: (number|null);
}

/** Represents a MyModel. */
export class MyModel implements IMyModel {

    /**
     * Constructs a new MyModel.
     * @param [properties] Properties to set
     */
    constructor(properties?: IMyModel);

    /** MyModel id. */
    public id: number;

    /** MyModel value. */
    public value: number;

    /**
     * Creates a new MyModel instance using the specified properties.
     * @param [properties] Properties to set
     * @returns MyModel instance
     */
    public static create(properties?: IMyModel): MyModel;

    /**
     * Encodes the specified MyModel message. Does not implicitly {@link MyModel.verify|verify} messages.
     * @param message MyModel message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IMyModel, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified MyModel message, length delimited. Does not implicitly {@link MyModel.verify|verify} messages.
     * @param message MyModel message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IMyModel, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a MyModel message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns MyModel
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): MyModel;

    /**
     * Decodes a MyModel message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns MyModel
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): MyModel;

    /**
     * Verifies a MyModel message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a MyModel message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns MyModel
     */
    public static fromObject(object: { [k: string]: any }): MyModel;

    /**
     * Creates a plain object from a MyModel message. Also converts values to other types if specified.
     * @param message MyModel
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: MyModel, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this MyModel to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for MyModel
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}
