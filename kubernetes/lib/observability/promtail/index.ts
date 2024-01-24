import { Helm } from 'cdk8s';
import { Construct } from 'constructs';

export class PromtailConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Helm(this, 'promtail', {
      chart: 'promtail',
      repo: 'https://grafana.github.io/helm-charts',
      values: {
        loki: {
          serviceName: 'loki-write',
          servicePort: 3100,
        },
        serviceMonitor: {
          enabled: true,
        },
      },
    });
  }
}
