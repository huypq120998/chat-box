import { io } from 'socket.io-client';
import { defaultHeader } from '../../utils/localStorage';

const URL = import.meta.env.VITE_BASE_DOMAIN;

export const chatSocket = io(URL, {
  autoConnect: false,
  extraHeaders: {
    ...defaultHeader()
  }
});