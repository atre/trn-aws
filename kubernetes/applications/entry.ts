import { App, AppProps, Chart } from "cdk8s";
import { Construct } from "constructs";
import { Entry } from "../lib/microservices/entry";

export class EntryChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Entry(this, 'entry');
  }
}

export class EntryApp extends App {
  constructor(props?: AppProps) {
    const appName = 'entry';

    super({ outdir: `dist/${appName}`, ...props })

    new EntryChart(this, appName);
  }
}