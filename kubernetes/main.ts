import { PostgresApp } from './applications/postgres';
import { ArgoCDApp } from './applications/argocd';
import { RedisApp } from './applications/redis';
import { ManagementApp } from './applications/management';
import { EntryApp } from './applications/entry';
import { UIApp } from './applications/ui';

// GitOps
new ArgoCDApp().synth();

// // DBs
new PostgresApp().synth();
new RedisApp().synth();


// Observability
// new PrometheusCRDChart(app, 'prometheus-crd');
// const prometheus = new PrometheusChart(app, 'prometheus');

// Network Ingress
// const traefik = new TraefikChart(app, 'traefik');

// // Broker message
// const rabbit = new RabbitMQChart(app, 'rabbitmq');

// // Application
new UIApp().synth();

new ManagementApp().synth();
new EntryApp().synth();
// const logic = new LogicChart(app, 'logic')
// const storage = new StorageChart(app, 'storage')

// const certificate = new CertificateChart(app, 'certificate')
// const grafana = new GrafanaChart(app, 'grafana');
// const logging = new LoggingChart(app, 'logging');

