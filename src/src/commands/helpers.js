import { RecFlareError, NotFoundError } from '../recflare/client.js';

export function describeError(error) {
  if (error instanceof NotFoundError) return error.message;
  if (error instanceof RecFlareError) return error.message || 'RecFlare request failed.';
  return 'Something went wrong while talking to RecFlare.';
}
