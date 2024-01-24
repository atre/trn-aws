import { Construct } from "constructs";
import { IntOrString, KubeDeployment, KubeService } from "../../imports/k8s";

export class Logic extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const label = { app: 'logic' };
    const servicePort = 8085;

    // Logic Deployment
    new KubeDeployment(this, 'logic-deployment', {
      metadata: {
        name: 'logic',
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
                name: 'logic',
                image: '894208094359.dkr.ecr.eu-central-1.amazonaws.com/trn-logic-ecr:0.1.0',
                ports: [
                  { containerPort: servicePort },
                ],
                env: [
                  { name: 'SERVER_PORT', value: '8085' },
                  { name: 'REDIS_HOST', value: 'redis' },
                  { name: 'REDIS_PORT', value: '6379' },
                  { name: 'REDIS_DB', value: '0' },
                  { name: 'RABBIT_HOST', value: 'rabbitmq' },
                  { name: 'RABBIT_USER', value: 'user' },
                  { name: 'RABBIT_PASSWORD', value: 'password' },
                  { name: 'RABBIT_PORT', value: '5672' },
                ],
              },
              {
                name: 'node-exporter',
                image: 'prom/node-exporter:v1.1.2',
                ports: [{ containerPort: 9100 }],
              },
            ],
          },
        },
      },
    });

    // Logic Service
    new KubeService(this, 'logic-service', {
      metadata: {
        name: 'logic',
        labels: label,
      },
      spec: {
        selector: label,
        ports: [
          { name: 'web', port: 8085, targetPort: IntOrString.fromNumber(servicePort) },
          { name: 'metrics', port: 9100, targetPort:  IntOrString.fromNumber(9100) },
        ],
      },
    });
  }
}