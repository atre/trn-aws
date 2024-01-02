import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { RabbitMQ } from "../lib/rabbitmq";

export class RabbitMQChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new RabbitMQ(this, 'rabbitmq');
  }
}
