import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { GrafanaConstruct } from "../lib/observability/grafana";

export class GrafanaChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new GrafanaConstruct(this, 'grafana');
  }
}