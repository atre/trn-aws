import { App, AppProps, Chart } from "cdk8s";
import { Construct } from "constructs";
import { ExternalDns } from "../lib/external-dns";

export class ExternalDnsChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new ExternalDns(this, 'vault');
  }
}

export class ExternalDnsApp extends App {
  constructor(props?: AppProps) {
    const appName = 'external-dns';

    super({ outdir: `dist/${appName}`, ...props })

    new ExternalDnsChart(this, appName);
  }
}