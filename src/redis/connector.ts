import { createClient, RedisClientType } from 'redis';

function connection(this: RedisService): Promise<null | RedisClientType> {
  // Cuando ejecutamos tests no queremos conectarnos a redis
  if (process.env.NODE_ENV === 'test') return Promise.resolve(null);

  return createClient({
    url: 'redis://default:PrakTiki34@cache:6369',
  })
    .connect()
    .then((client) => {
      const _client = client as RedisClientType;
      _client.on('error', (e: Error) => {
        this.status = 'error';
        console.error('Redis error: ' + e.stack);
      });

      console.info('👾👾👾👾 Conectado a redis, cache activada 👾👾👾👾');
      this.status = 'ready';

      // Aqui seteamos el cliente, para que se pueda usar para prox conexiones
      this.client = _client; // Ensure proper typing
      return _client as RedisClientType;
    })
    .catch((err: Error) => {
      console.error(err.stack);
      return null;
    });
}

type ConnectionOptions = {
  forceNewConnection?: boolean;
};

class RedisService {
  client: RedisClientType | null;
  connectionProcess: Promise<null | RedisClientType> | null;
  connection: () => Promise<null | RedisClientType>;
  status: 'not-ready' | 'ready' | 'error';

  constructor() {
    this.client = null;
    this.connectionProcess = null;
    this.connection = connection.bind(this);
    this.status = 'not-ready';
    this.getClient();
  }

  getClient(options: ConnectionOptions = {}) {
    const { forceNewConnection } = options;

    // Si queremos forzar obtener un cliente nuevo de Redis
    if (forceNewConnection) return this.connection();

    // Si queremos reutilizar la conexion
    if (this.client) return this.client;

    // Si queremos reutilizar la conexion, pero es la primera vez o la primera conexion aun esta en curso
    if (!this.connectionProcess) this.connectionProcess = this.connection();
    return this.connectionProcess;
  }

  get isReady(): boolean {
    return !!this.client && this.status === 'ready';
  }
}

export default new RedisService();
