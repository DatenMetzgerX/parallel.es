/**
 * A very simple implementation of a map. Do not use with complex objects as Key.
 * @param K type of the key
 * @param V type of the value
 */
export class SimpleMap<K, V> {
  private data: { [key: string]: V } = {};

  /**
   * Gets the value for the given key if available
   * @param key the key to look up
   * @returns the looked up value or undefined if the map does not contain any value associated with the given key
   */
  public get(key: K): V | undefined {
    const internalKey = this.toInternalKey(key);
    return this.has(key) ? this.data[internalKey] : undefined;
  }

  /**
   * Tests if the map contains value stored by the given key
   * @param key the key
   * @returns true if the map contains a value by the given key, false otherwise
   */
  public has(key: K): boolean {
    return this.hasOwnProperty.call(this.data, this.toInternalKey(key));
  }

  /**
   * Sets the value for the given key. If the map already contains a value stored by the given key, then this value is
   * overridden
   * @param key the key
   * @param value the value to associate with the given key
   */
  public set(key: K, value: V): void {
    this.data[this.toInternalKey(key)] = value;
  }

  /**
   * Clears all values from the map
   */
  public clear(): void {
    this.data = {};
  }

  private toInternalKey(key: K): string {
    return `@${key}`;
  }
}
