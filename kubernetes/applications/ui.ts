import { App, AppProps, Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { UI } from "../lib/microservices/ui";

export class UiChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new UI(this, 'ui');
  }
}

export class UIApp extends App {
  constructor(props?: AppProps) {
    const appName = 'ui';

    super({ outdir: `dist/${appName}`, ...props })

    new UiChart(this, appName);
  }
}