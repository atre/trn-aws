import { Chart, ChartProps } from "cdk8s";
import { Construct } from "constructs";
import { Traefik } from "../lib/traefik";

export class TraefikChart extends Chart {
  constructor(scope: Construct, id: string, props: ChartProps = { }) {
    super(scope, id, props);

    new Traefik(this, 'traefik');
  }
}
