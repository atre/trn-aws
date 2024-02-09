import { App, AppProps, Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { RabbitMQ } from "../lib/rabbitmq";

export class RabbitMQChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new RabbitMQ(this, 'rabbitmq');
  }
}

export class RabbitMQApp extends App {
  constructor(props?: AppProps) {
    const appName = 'rabbitmq';

    super({ outdir: `dist/${appName}`, ...props })

    new RabbitMQChart(this, appName);
  }
}