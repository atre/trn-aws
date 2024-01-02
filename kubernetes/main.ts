import { App } from 'cdk8s';
import { TraefikChart } from './charts/traefik';
import { PostgresChart } from './charts/postgres';
import { UiChart } from './charts/ui';
import { ManagementChart } from './charts/management';
import { RedisChart } from './charts/redis';
import { RabbitMQChart } from './charts/rabbitmq';
import { EntryChart } from './charts/entry';
import { LogicChart } from './charts/logic';
import { StorageChart } from './charts/storage';

const app = new App();

// Network Ingress
new TraefikChart(app, 'traefik');

// DBs
new PostgresChart(app, 'postgres');
new RedisChart(app, 'redis');

// Broker message
new RabbitMQChart(app, 'rabbitmq');

// Application
new UiChart(app, 'ui');

new ManagementChart(app, 'management');

new EntryChart(app, 'entry');
new LogicChart(app, 'logic');
new StorageChart(app, 'storage');

app.synth();
