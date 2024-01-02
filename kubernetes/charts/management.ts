import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { Management } from "../lib/management";

export class ManagementChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new Management(this, 'management');
  }
}
