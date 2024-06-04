import { LogOrigin } from 'ontime-types';

import { IAdapter } from './IAdapter.js';
import { logger } from '../classes/Logger.js';
import { integrationPayloadFromPath } from './utils/parse.js';
import { dispatchFromAdapter } from '../api-integration/integration.controller.js';

import { Argument } from 'node-osc';
import { createSocket, type Socket } from 'node:dgram';
import oscMin from 'osc-min';
const { toBuffer, fromBuffer } = oscMin;

export class OscServer implements IAdapter {
  private readonly socket: Socket;

  constructor(portIn: number, feedback: boolean = true) {
    this.socket = createSocket({
      type: 'udp4',
      reuseAddr: true,
    });

    this.socket.bind(portIn);

    this.socket.on('message', (buffer, rinfo) => {
      let decoded: { address: string; args: Argument[]; elements?: any };
      try {
        decoded = fromBuffer(buffer);
      } catch (error) {
        logger.error(LogOrigin.Rx, `OSC IN: can't decode incoming message: ${error.message}`);
        return;
      }

      if (!decoded || decoded.elements) {
        // nothing decoded or
        //we don't handle bundles
        return;
      }

      // message should look like /ontime/{command}/{params?} {args} where
      // ontime: fixed message for app
      // command: command to be called
      // params: used to create a nested object to patch with
      // args: extra data, only used on some API entries

      // split message
      const [, address, command, ...params] = decoded.address.split('/');
      const args = decoded.args[0]; // we only concern our self with the first arg

      // get first part before (ontime)
      if (address !== 'ontime') {
        logger.error(
          LogOrigin.Rx,
          `OSC IN: OSC messages to ontime must start with /ontime/, received: ${decoded.address}`,
        );
        return;
      }

      // get second part (command)
      if (!command) {
        logger.error(LogOrigin.Rx, 'OSC IN: No path found');
        return;
      }

      let transformedPayload: unknown = args;
      // we need to transform the params for the more complex endpoints
      if (params.length) {
        transformedPayload = integrationPayloadFromPath(params, args);
      }

      try {
        const reply = dispatchFromAdapter(command, transformedPayload, 'osc');
        if (feedback) {
          const buff = toBuffer(decoded.address, reply.payload);
          this.socket.send(buff, rinfo.port, rinfo.address);
        }
      } catch (error) {
        logger.error(LogOrigin.Rx, `OSC IN: ${error}`);
      }
    });
  }

  shutdown() {
    this.socket.close();
  }
}
