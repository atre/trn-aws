import { App, AppProps, Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { GrafanaConstruct } from "../lib/observability/grafana";

export class GrafanaChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new GrafanaConstruct(this, 'grafana');
  }
}

export class GrafanaApp extends App {
  constructor(props?: AppProps) {
    const appName = 'grafana';

    super({ outdir: `dist/${appName}`, ...props })

    new GrafanaChart(this, appName);
  }
}