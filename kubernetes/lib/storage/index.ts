import { Construct } from "constructs";
import { IntOrString, KubeDeployment, KubeService } from "../../imports/k8s";

export class Storage extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const label = { app: 'storage' };
    const servicePort = 8082;

    new KubeDeployment(this, 'storage-deployment', {
      metadata: {
        name: 'storage',
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
                name: 'storage',
                image: '894208094359.dkr.ecr.eu-central-1.amazonaws.com/trn-storage-ecr:0.1.0',
                ports: [
                  { containerPort: servicePort },
                ],
                env: [
                  { name: 'SERVER_PORT', value: '8082' },
                  { name: 'DB_HOST', value: 'postgres' },
                  { name: 'DB_PORT', value: '5432' },
                  { name: 'DB_USER', value: 'postgres' },
                  { name: 'DB_PASSWORD', value: 'postgres' },
                  { name: 'DB_NAME', value: 'postgres' },
                  { name: 'RABBIT_HOST', value: 'rabbitmq' },
                  { name: 'RABBIT_USER', value: 'user' },
                  { name: 'RABBIT_PASSWORD', value: 'password' },
                  { name: 'RABBIT_PORT', value: '5672' },
                ],
              },
            ],
          },
        },
      },
    });

    new KubeService(this, 'storage-service', {
      metadata: {
        name: 'storage',
      },
      spec: {
        selector: label,
        ports: [
          { name: 'http', port: 8082, targetPort: IntOrString.fromNumber(servicePort) },
        ],
      },
    });
  }
}