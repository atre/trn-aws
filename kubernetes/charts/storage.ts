import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { Storage } from "../lib/storage";

export class StorageChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new Storage(this, 'storage');
  }
}