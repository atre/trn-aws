import { App, AppProps, Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { Traefik } from "../lib/traefik";

export class TraefikChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new Traefik(this, 'traefik');
  }
}

export class TraefikApp extends App {
  constructor(props?: AppProps) {
    const appName = 'traefik';

    super({ outdir: `dist/${appName}`, ...props })

    new TraefikChart(this, appName);
  }
}