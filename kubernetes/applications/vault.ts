import { App, AppProps, Chart } from "cdk8s";
import { Construct } from "constructs";
// import { ExternalSecrets } from "../lib/vault";
import { ExternalSecrets, Reloader, Vault } from "../lib/vault";

export class VaultChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Vault(this, 'vault');
    new Reloader(this, 'pod-reloader');
    new ExternalSecrets(this, 'external-secrets');
  }
}

export class VaultApp extends App {
  constructor(props?: AppProps) {
    const appName = 'vault';

    super({ outdir: `dist/${appName}`, ...props })

    new VaultChart(this, appName);
  }
}