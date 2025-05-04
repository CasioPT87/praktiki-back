import { RedisClientType } from 'redis';
import { PlainObject } from '../types/entities/versatile';

import redisService from './connector';
import { User } from '../types/entities';

export class Cache {
  cache: RedisClientType | null = null;

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
      return null;
    }

    await this.cache.set(key, JSON.stringify(value), {
      EX: cache_ttl,
      NX: true, // only set the key if it does Not eXists
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

  async delete(key = '') {
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

export class ListManager {
  prefix = 'language-manager-list-';
  client: RedisClientType | null = null;
  name: string = '';

  constructor({ languageCombinationId }: { languageCombinationId: number }) {
    if (this.shouldConnect) {
      this.connect();
      this.name = this.prefix + languageCombinationId;
    } else {
      console.warn(
        '👾👾👾👾 List Manager deshabilitado (entorno test), no conectamos 👾👾👾👾'
      );
    }
  }

  get shouldConnect() {
    return process.env.NODE_ENV !== 'test';
  }

  async connect() {
    const client = await redisService.getClient();
    this.client = client;
  }

  async addToList(userId: User['id']) {
    await this.client?.sAdd(this.name, String(userId));
  }

  async removeFromList(userId: User['id']) {
    await this.client?.sRem(this.name, String(userId));
  }

  async getAllFromList() {
    await this.client?.sMembers(this.name);
  }
}
