import { Helm } from 'cdk8s';
import { Construct } from 'constructs';

export class LokiConstruct extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Helm(this, 'loki', {
      chart: 'loki',
      repo: 'https://grafana.github.io/helm-charts',
      values: {
        storageConfig: {
          aws: {
            s3: 
          }
        }
      },
    });
  }
}
