import { App, AppProps, Chart, ChartProps, Include } from "cdk8s";
import { Construct } from "constructs";
import { PrometheusConstruct } from "../lib/observability/prometheus";

export class PrometheusChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new Include(this, 'prometheus_crd', {
      url: 'https://github.com/prometheus-operator/prometheus-operator/releases/download/v0.70.0/bundle.yaml',
    }); 

    new PrometheusConstruct(this, 'prometheus');
  }
}

export class PrometheusApp extends App {
  constructor(props?: AppProps) {
    const appName = 'prometheus';

    super({ outdir: `dist/${appName}`, ...props })

    new PrometheusChart(this, appName);
  }
}