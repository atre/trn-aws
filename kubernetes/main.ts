import { PostgresApp } from './applications/postgres';
import { ArgoCDApp } from './applications/argocd';
import { RedisApp } from './applications/redis';
import { ManagementApp } from './applications/management';
import { EntryApp } from './applications/entry';
import { UIApp } from './applications/ui';
import { LogicApp } from './applications/logic';
import { RabbitMQApp } from './applications/rabbitmq';
import { StorageApp } from './applications/storage';

// GitOps
new ArgoCDApp().synth();

// // DBs
new PostgresApp().synth();
new RedisApp().synth();


// Observability
// new PrometheusCRDChart(app, 'prometheus-crd');
// const prometheus = new PrometheusChart(app, 'prometheus');
// const grafana = new GrafanaChart(app, 'grafana');
// const logging = new LoggingChart(app, 'logging');

// Network Ingress
// const traefik = new TraefikChart(app, 'traefik');

// Broker message
new RabbitMQApp().synth();

// Application
new UIApp().synth();

new ManagementApp().synth();
new EntryApp().synth();
new LogicApp().synth();
new StorageApp().synth();

// Security
// const certificate = new CertificateChart(app, 'certificate')


