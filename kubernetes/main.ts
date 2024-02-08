import { PostgresApp } from './applications/postgres';
import { ArgoCDApp } from './applications/argocd';
import { RedisApp } from './applications/redis';
import { ManagementApp } from './applications/management';

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
// const ui = new UiChart(app, 'ui');

new ManagementApp().synth();

// const entry = new EntryChart(app, 'entry')
// const logic = new LogicChart(app, 'logic')
// const storage = new StorageChart(app, 'storage')

// const certificate = new CertificateChart(app, 'certificate')
// const grafana = new GrafanaChart(app, 'grafana');
// const logging = new LoggingChart(app, 'logging');

// Dependencies
// management.chart.addDependency(postgres);
// entry.addDependency(rabbit);
// logic.addDependency(rabbit, redis);
// storage.addDependency(postgres, rabbit, management);
// certificate.addDependency(traefik);
// ui.addDependency(management, entry);
// grafana.addDependency(prometheus);
// logging.addDependency(grafana);

