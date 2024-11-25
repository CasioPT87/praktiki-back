import { createClient, RedisClientType } from 'redis';

type Connection = RedisClientType | void;
type ConnectionService = Promise<Connection> | void;

function connection(this: RedisService): ConnectionService {
  // Cuando ejecutamos tests no queremos conectarnos a redis
  if (process.env.NODE_ENV === 'test') return;

  return createClient({
    url: 'redis://default:PrakTiki34@cache:6379',
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
    });
}

type ConnectionOptions = {
  forceNewConnection?: boolean;
};

class RedisService {
  client: RedisClientType | null;
  connectionProcess: ConnectionService | null;
  connection: () => ConnectionService;
  status: 'not-ready' | 'ready' | 'error';

  constructor() {
    this.client = null;
    this.connectionProcess = null;
    this.connection = connection.bind(this);
    this.status = 'not-ready';
    this.getClient();
  }

  getClient(options: ConnectionOptions = {}): ConnectionService | Connection {
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
