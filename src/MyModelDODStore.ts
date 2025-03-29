// TODO: test a new data model, where it's 100 fields, compare the performance with Pbjs

/**
 * MyModelDODStore acts as a memory store for decoding MyModel messages
 * using a Data-Oriented Design approach.
 *
 * Each MyModel message is assumed to be 14 bytes:
 *   - Byte 0: tag (ignored)
 *   - Bytes 1-4: fixed32 id (little-endian)
 *   - Byte 5: tag (ignored)
 *   - Bytes 6-13: double value (little-endian)
 */
export class MyModelDODStore {
    // Each message is 14 bytes.
    public readonly MESSAGE_SIZE = 14;
    // The pre-allocated target buffer.
    private targetBuffer: Uint8Array;
    // The maximum number of messages that can be stored in targetBuffer.
    public readonly maxMessages: number;
    // Pre-allocated output arrays.
    private preallocatedIds: Uint32Array;
    private preallocatedValues: Float64Array;

    /**
     * @param targetBufferSize The size in bytes to preallocate (e.g., 20 * 1024 * 1024 for 20MB).
     */
    constructor(targetBufferSize: number) {
        this.targetBuffer = new Uint8Array(targetBufferSize);
        this.maxMessages = Math.floor(targetBufferSize / this.MESSAGE_SIZE);
        this.preallocatedIds = new Uint32Array(this.maxMessages);
        this.preallocatedValues = new Float64Array(this.maxMessages);
    }

    /**
     * Concatenates an array of Uint8Array messages into the pre-allocated target buffer.
     *
     * @param arrays An array of Uint8Array, each representing a single MyModel message.
     * @returns The total number of bytes written into the target buffer.
     */
    private concatUint8ArraysInPlace(arrays: Uint8Array[]): number {
        let offset = 0;
        for (const arr of arrays) {
            if (offset + arr.length > this.targetBuffer.length) {
                throw new Error(
                    "Target buffer is not large enough to hold all data.",
                );
            }
            this.targetBuffer.set(arr, offset);
            offset += arr.length;
        }
        return offset;
    }

    /**
     * Decodes a contiguous buffer of MyModel messages into the pre-allocated output arrays.
     *
     * @param contiguousBuffer A Uint8Array containing concatenated messages.
     * @returns The number of messages decoded.
     */
    private decodePreallocated(contiguousBuffer: Uint8Array): number {
        if (contiguousBuffer.byteLength % this.MESSAGE_SIZE !== 0) {
            throw new Error("Buffer length is not a multiple of message size.");
        }
        const count = contiguousBuffer.byteLength / this.MESSAGE_SIZE;
        const dv = new DataView(
            contiguousBuffer.buffer,
            contiguousBuffer.byteOffset,
            contiguousBuffer.byteLength,
        );
        for (let i = 0; i < count; i++) {
            const base = i * this.MESSAGE_SIZE;
            // Directly decode without tag checks.
            this.preallocatedIds[i] = dv.getUint32(base + 1, true);
            this.preallocatedValues[i] = dv.getFloat64(base + 6, true);
        }
        return count;
    }

    /**
     * Decodes a list of individual MyModel messages.
     *
     * This method concatenates the input messages into the internal target buffer,
     * then decodes them into the pre-allocated output arrays.
     *
     * @param messages An array of Uint8Array, each representing a single MyModel.
     * @returns An object containing the number of messages decoded,
     *          the ids array, and the values array.
     */
    public decodeFromList(messages: Uint8Array[]): {
        count: number;
        ids: Uint32Array;
        values: Float64Array;
    } {
        const totalLen = this.concatUint8ArraysInPlace(messages);
        // Create a subarray view of the target buffer containing only the concatenated data.
        const contiguousBuffer = this.targetBuffer.subarray(0, totalLen);
        const count = this.decodePreallocated(contiguousBuffer);
        return {
            count,
            ids: this.preallocatedIds,
            values: this.preallocatedValues,
        };
    }
}
