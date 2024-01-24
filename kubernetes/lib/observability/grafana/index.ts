import { Helm } from 'cdk8s';
import * as fs from 'fs';
import * as path from 'path';
import { Construct } from 'constructs';

export class GrafanaConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const goldenMetricsDashboard = fs.readFileSync(path.join(__dirname, './dashboards/golden-metrics-dashboard.json'), 'utf8');

    new Helm(this, 'grafana', {
      chart: 'grafana',
      repo: 'https://grafana.github.io/helm-charts',
      values: {
        adminPassword: 'password',
          datasources: {
          [`datasources.yaml`]: {
            apiVersion: 1,
            datasources: [
              {
                name: 'Prometheus',
                type: 'prometheus',
                url: 'http://prometheus-operated.default.svc.cluster.local:9090',
                access: 'proxy',
                isDefault: true,
              },
              {
                name: 'Loki',
                type: 'loki',
                url: 'http://loki-read.your-namespace.svc.cluster.local:3100',
                access: 'proxy',  
              }
            ],
          },
        },
        dashboardProviders: {
        ['dashboardproviders.yaml']: {
            apiVersion: 1,
            providers: [
              {
                name: 'default',
                orgId: 1,
                folder: '',
                type: 'file',
                disableDeletion: false,
                editable: true,
                options: {
                  path: '/var/lib/grafana/dashboards/default',
                },
              },
            ],
          },
        },
        dashboards: {
          default: {
            'node-exporter-full': {
              gnetId: 1860,
              revision: 33,
              datasource: 'Prometheus',
            },
            'golden-metrics': {
              json: goldenMetricsDashboard,
              datasource: 'Prometheus'
            }
          }
        }
      },
    });
  }
}
