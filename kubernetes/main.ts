import { PostgresApp } from './applications/postgres';
import { ArgoCDApp } from './applications/argocd';
import { RedisApp } from './applications/redis';
import { ManagementApp } from './applications/management';
import { EntryApp } from './applications/entry';
import { UIApp } from './applications/ui';
import { LogicApp } from './applications/logic';
import { RabbitMQApp } from './applications/rabbitmq';
import { StorageApp } from './applications/storage';
import { TraefikApp } from './applications/traefik';
import { GrafanaApp } from './applications/grafana';
import { PrometheusApp } from './applications/prometheus';

// GitOps
new ArgoCDApp().synth();

// // DBs
new PostgresApp().synth();
new RedisApp().synth();

// Observability
new PrometheusApp().synth();
new GrafanaApp().synth();

// Network Ingress
new TraefikApp().synth();

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


