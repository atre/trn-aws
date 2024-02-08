import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { LokiConstruct } from "../lib/observability/loki";
import { PromtailConstruct } from "../lib/observability/promtail";

export class LoggingChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new LokiConstruct(this, 'loki');
    new PromtailConstruct(this, 'promtail');
  }
}