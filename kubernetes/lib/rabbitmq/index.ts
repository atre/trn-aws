import { Construct } from "constructs";
import { IntOrString, KubeDeployment, KubeService } from "../../imports/k8s";

export class RabbitMQ extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const label = { app: 'rabbitmq' };
    const exporterPort = 9419;

    new KubeDeployment(this, 'rabbitmq-deployment', {
      metadata: {
        name: 'rabbitmq',
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
                name: 'rabbitmq',
                image: 'rabbitmq:3-management',
                ports: [
                  { containerPort: 5672 },
                  { containerPort: 15672 },
                ],
                env: [
                  { name: 'RABBITMQ_DEFAULT_USER', value: 'user' },
                  { name: 'RABBITMQ_DEFAULT_PASS', value: 'password' },
                ],
                readinessProbe: {
                  httpGet: {
                    path: '/',
                    port: IntOrString.fromNumber(15672),
                  },
                  initialDelaySeconds: 15,
                  timeoutSeconds: 5,
                },
              },
              {
                name: 'rabbitmq-exporter',
                image: 'ghcr.io/kbudde/rabbitmq_exporter:1.0.0-RC19',
                env: [
                  { name: 'RABBITMQ_URL', value: 'http://localhost:15672' },
                  { name: 'RABBITMQ_USER', value: 'user' },
                  { name: 'RABBITMQ_PASSWORD', value: 'password' },
                ],
                ports: [{ containerPort: exporterPort }],
              },
            ],
          },
        },
      },
    });

    new KubeService(this, 'rabbitmq-service', {
      metadata: {
        name: 'rabbitmq',
        labels: label,
      },
      spec: {
        selector: label,
        ports: [
          { name: 'amqp', port: 5672, targetPort: IntOrString.fromNumber(5672) },
          { name: 'management', port: 15672, targetPort: IntOrString.fromNumber(15672) },
          { name: 'metrics', port: exporterPort, targetPort: IntOrString.fromNumber(exporterPort) },
        ],
      },
    });
  }
}