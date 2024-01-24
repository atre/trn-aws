import { Construct } from "constructs";
import { IntOrString, KubeDeployment, KubeService } from "../../imports/k8s";

export class Redis extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const label = { app: 'redis' };
    const exporterPort = 9121;

    new KubeDeployment(this, 'redis-deployment', {
      metadata: {
        name: 'redis',
      },
      spec: {
        replicas: 1,
        selector: {
          matchLabels: label,
        },
        template: {
          metadata: {
            labels: label,
          },
          spec: {
            containers: [
              {
                name: 'redis',
                image: 'redis:7.2.3-alpine',
                ports: [
                  { containerPort: 6379 },
                ],
                volumeMounts: [
                  {
                    name: 'redis-data',
                    mountPath: '/data',
                  },
                ],
              },
              {
                name: 'redis-exporter',
                image: 'oliver006/redis_exporter:v1.56.0',
                ports: [{ containerPort: exporterPort }],
                env: [
                  {
                    name: 'REDIS_ADDR',
                    value: 'localhost:6379',
                  },
                ],
              }
            ],
            volumes: [
              {
                name: 'redis-data',
                emptyDir: {},
              },
            ],
          },
        },
      },
    });

    new KubeService(this, 'redis-service', {
      metadata: {
        name: 'redis',
        labels: label,
      },
      spec: {
        selector: label,
        ports: [
          { name: 'redis', port: 6379, targetPort: IntOrString.fromNumber(6379) },
          { name: 'metrics', port: exporterPort, targetPort: IntOrString.fromNumber(exporterPort) },
        ],
      },
    });
  }
}