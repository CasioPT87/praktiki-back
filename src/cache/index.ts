import { PlainObject } from '../types/entities/versatile';

import redisService from './connector';

class Cache {
  cache: any;

  constructor() {
    if (this.shouldConnect) {
      this.connect();
    } else {
      console.warn(
        '👾👾👾👾 Cache deshabilitada (entorno test), no conectamos 👾👾👾👾'
      );
    }
  }

  get shouldConnect() {
    return process.env.NODE_ENV !== 'test';
  }

  async connect() {
    const client = await redisService.getClient();
    this.cache = client;
  }

  /* Sets the value in cache */
  async set(
    key: string,
    cache_ttl: number,
    value: string | number | boolean | PlainObject
  ) {
    if (!this.cache || !redisService.isReady) {
      return value;
    }

    await this.cache.set(key, JSON.stringify(value), {
      EX: cache_ttl,
      NX: true,
    });

    return value;
  }

  async get(key: string) {
    if (!this.cache || !redisService.isReady) {
      return null;
    }
    const value = await this.cache.get(key);
    if (value) {
      return JSON.parse(value);
    }

    return null;
  }

  /* Gets the value from cache and save if doesn't exists */
  async getOrSet(key: string, cache_ttl: number, storeFunction: () => any) {
    if (!this.cache || !redisService.isReady) {
      return await storeFunction();
    }

    const value = await this.cache.get(key);
    if (value) {
      return JSON.parse(value);
    }

    const result = await storeFunction();
    if (result)
      await this.cache.set(key, JSON.stringify(result), {
        EX: cache_ttl,
        NX: true,
      });
    return result;
  }

  async del(key: string) {
    await this.cache.del(key);
  }

  async allKeys() {
    const uniqueKeys = new Set();
    for await (const key of this.cache.scanIterator()) {
      const keyName = key.split(':')[1];
      uniqueKeys.add(keyName);
    }
    return Array.from(uniqueKeys);
  }

  async flush() {
    const result = await this.cache.sendCommand(['FLUSHALL']);
    return { flushed: result === 'OK' };
  }

  async deleteKey(key = '') {
    if (!this.cache) {
      return { deleted: false };
    }

    try {
      const deleted = await this.cache.del(key);
      return { deleted: !!deleted };
    } catch (error) {
      return { deleted: false };
    }
  }
}

export default new Cache();
