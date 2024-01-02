import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { Redis } from "../lib/redis";

export class RedisChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new Redis(this, 'redis');
  }
}
