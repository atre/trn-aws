import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { PrometheusConstruct } from "../lib/observability/prometheus";

export class PrometheusChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new PrometheusConstruct(this, 'prometheus');
  }
}