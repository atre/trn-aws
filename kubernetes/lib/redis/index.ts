import { Construct } from "constructs";
import { IntOrString, KubeDeployment, KubeService } from "../../imports/k8s";

export class Redis extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const label = { app: 'redis' };

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
      },
      spec: {
        selector: label,
        ports: [
          { name: 'redis', port: 6379, targetPort: IntOrString.fromNumber(6379) },
        ],
      },
    });
  }
}