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
import { CertificateChart } from './charts/certificate';

const app = new App();

// Network Ingress
const traefik = new TraefikChart(app, 'traefik');

// DBs
const postgres = new PostgresChart(app, 'postgres');
const redis = new RedisChart(app, 'redis');

// Broker message
const rabbit = new RabbitMQChart(app, 'rabbitmq');

// Application
const ui = new UiChart(app, 'ui');

const management = new ManagementChart(app, 'management');

const entry = new EntryChart(app, 'entry')
const logic = new LogicChart(app, 'logic')
const storage = new StorageChart(app, 'storage')

const certificate = new CertificateChart(app, 'certificate')

// Dependencies
management.addDependency(postgres);
entry.addDependency(rabbit);
logic.addDependency(rabbit, redis);
storage.addDependency(postgres, rabbit, management);
certificate.addDependency(traefik);
ui.addDependency(management, entry);


app.synth();
