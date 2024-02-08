import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { PostgresDatabase } from "../lib/db/postgres";

export class PostgresChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new PostgresDatabase(this, 'postgres');
  }
}
