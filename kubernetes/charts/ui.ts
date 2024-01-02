import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { UI } from "../lib/ui";

export class UiChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new UI(this, 'ui');
  }
}