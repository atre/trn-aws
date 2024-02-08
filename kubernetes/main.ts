import { App } from 'cdk8s';
// import { TraefikChart } from './charts/traefik';
import { PostgresChart } from './charts/postgres';
// import { UiChart } from './charts/ui';
// import { ManagementChart } from './charts/management';
import { RedisChart } from './charts/redis';
// import { RabbitMQChart } from './charts/rabbitmq';
// import { EntryChart } from './charts/entry';
// import { LogicChart } from './charts/logic';
// import { StorageChart } from './charts/storage';
// import { CertificateChart } from './charts/certificate';
// import { PrometheusChart } from './charts/prometheus';
// import { PrometheusCRDChart } from './charts/crd';
// import { GrafanaChart } from './charts/grafana';
import { ArgoCDChart } from './charts/argocd';
// import { LoggingChart } from './charts/logging';

const db = new App({outdir: 'dist/databases'});

// Observability
// new PrometheusCRDChart(app, 'prometheus-crd');
// const prometheus = new PrometheusChart(app, 'prometheus');

// Network Ingress
// const traefik = new TraefikChart(app, 'traefik');

// // DBs
new PostgresChart(db, 'postgres');
new RedisChart(db, 'redis');

// // Broker message
// const rabbit = new RabbitMQChart(app, 'rabbitmq');

// // Application
// const ui = new UiChart(app, 'ui');

// const management = new ManagementChart(app, 'management');

// const entry = new EntryChart(app, 'entry')
// const logic = new LogicChart(app, 'logic')
// const storage = new StorageChart(app, 'storage')

// const certificate = new CertificateChart(app, 'certificate')
// const grafana = new GrafanaChart(app, 'grafana');
// const logging = new LoggingChart(app, 'logging');

// Dependencies
// management.addDependency(postgres);
// entry.addDependency(rabbit);
// logic.addDependency(rabbit, redis);
// storage.addDependency(postgres, rabbit, management);
// certificate.addDependency(traefik);
// ui.addDependency(management, entry);
// grafana.addDependency(prometheus);
// logging.addDependency(grafana);

db.synth();

const gitOps = new App({outdir: 'dist/gitops'});

new ArgoCDChart(gitOps, 'argocd');

gitOps.synth();