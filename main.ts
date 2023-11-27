import { App } from 'cdktf';
import { Vpc } from './src/vpc';

const app = new App();

new Vpc(app, 'vpc');

app.synth();
