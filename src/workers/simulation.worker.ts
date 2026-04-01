import { runMonteCarlo } from '../utils/monteCarlo';
import type { WorkerRequest, WorkerResponse } from '../types';

self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { params, iterations } = event.data;
  const result = runMonteCarlo(params, iterations);
  const response: WorkerResponse = { result };
  self.postMessage(response);
};
