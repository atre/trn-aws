import { App, AppProps, Chart } from "cdk8s";
import { Construct } from "constructs";
import { ArgoCD } from "../lib/argocd";

export class ArgoCDChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new ArgoCD(this, 'argocd');
  }
}

export class ArgoCDApp extends App {
  constructor(props?: AppProps) {
    const appName = 'argocd';

    super({ outdir: `dist/${appName}`, ...props })

    new ArgoCDChart(this, appName);
  }
}