import { App, AppProps, Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { Management } from "../lib/microservices/management";

export class ManagementChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new Management(this, 'management');
  }
}

export class ManagementApp extends App {
  public chart: ManagementChart;

  constructor(props?: AppProps) {
    const appName = 'management';

    super({ outdir: `dist/${appName}`, ...props })

    this.chart = new ManagementChart(this, appName);
  }
}