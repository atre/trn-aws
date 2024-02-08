import { Chart } from "cdk8s";
import { Construct } from "constructs";
import { Entry } from "../lib/microservices/entry";

export class EntryChart extends Chart {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new Entry(this, 'entry');
  }
}