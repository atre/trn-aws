import { App, AppProps, Chart } from "cdk8s";
import { Construct } from "constructs";
import { Cert } from "../lib/cert";

export class CertificateChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Cert(this, 'certificate');
  }
}

export class CertificateApp extends App {
  constructor(props?: AppProps) {
    const appName = 'certificate';

    super({ outdir: `dist/${appName}`, ...props })

    new CertificateChart(this, appName);
  }
}