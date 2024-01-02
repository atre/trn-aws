import { Construct } from "constructs";
import { IntOrString, KubeDeployment, KubeService } from "../../imports/k8s";

export class RabbitMQ extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const label = { app: 'rabbitmq' };

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
              },
            ],
          },
        },
      },
    });

    new KubeService(this, 'rabbitmq-service', {
      metadata: {
        name: 'rabbitmq',
      },
      spec: {
        selector: label,
        ports: [
          { name: 'amqp', port: 5672, targetPort: IntOrString.fromNumber(5672) },
          { name: 'management', port: 15672, targetPort: IntOrString.fromNumber(15672) },
        ],
      },
    });
  }
}