import { PlainObject } from '../types/entities/versatile';

import redisService from './connector';

const getKey = (key: string) => {
  const prefix = `${process.env.PORTAL_NAME}:` || '';
  return prefix + key;
};

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

    await this.cache.set(getKey(key), JSON.stringify(value), {
      EX: cache_ttl,
      NX: true,
    });

    return value;
  }

  /* Gets the value from cache and save if doesn't exists */
  async getOrSet(key: string, cache_ttl: number, storeFunction: () => any) {
    if (!this.cache || !redisService.isReady) {
      return await storeFunction();
    }

    const value = await this.cache.get(getKey(key));
    if (value) {
      console.log(`######## get from cache ${getKey(key)} #########`);
      return JSON.parse(value);
    }

    const result = await storeFunction();
    if (result)
      await this.cache.set(getKey(key), JSON.stringify(result), {
        EX: cache_ttl,
        NX: true,
      });
    return result;
  }

  async del(key: string) {
    await this.cache.del(getKey(key));
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
      console.error(
        'Intento de eliminar una clave cuando la caché no está conectada.'
      );
      return { deleted: false };
    }

    try {
      const deleted = await this.cache.del(getKey(key));
      return { deleted: !!deleted };
    } catch (error) {
      console.error(`Error al eliminar la clave de caché: ${key}`, error);
      return { deleted: false };
    }
  }
}

module.exports = new Cache();
