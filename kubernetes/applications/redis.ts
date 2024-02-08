import { App, AppProps, Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { Redis } from "../lib/db/redis";

export class RedisChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new Redis(this, 'redis');
  }
}

export class RedisApp extends App {
  constructor(props?: AppProps) {
    const appName = 'redis';

    super({ outdir: `dist/${appName}`, ...props })

    new RedisChart(this, appName);
  }
}