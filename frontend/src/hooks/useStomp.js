import { useState, useEffect, useCallback, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

const useStomp = (sessionId) => {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const subscriptions = useRef({});

  const stompClientRef = useRef(null);

  const connect = useCallback(() => {
    if (stompClientRef.current && connected) return;

    const socket = new SockJS('/ws-stomp');
    const stompClient = Stomp.over(socket);
    
    stompClient.connect({}, (frame) => {
      console.log('STOMP Connected: ' + frame);
      stompClientRef.current = stompClient;
      setClient(stompClient);
      setConnected(true);
    }, (error) => {
      console.error('STOMP Connection Error: Fallback to BroadcastChannel Mock');
      
      const channel = new BroadcastChannel(`mock-channel-${sessionId}`);
      const mockClient = {
        subscribe: (topic, cb) => {
          const handler = (msg) => {
            if (msg.data.topic === topic) {
              setEvents(prev => [...prev, msg.data.body]);
              cb({ body: JSON.stringify(msg.data.body) });
            }
          };
          channel.addEventListener('message', handler);
          return { unsubscribe: () => channel.removeEventListener('message', handler) };
        },
        send: (dest, headers, bodyString) => {
          const topic = dest.replace('/app/', '/topic/');
          const body = JSON.parse(bodyString);
          channel.postMessage({ topic, body });
          setEvents(prev => [...prev, body]);
        },
        disconnect: () => {
          channel.close();
        }
      };
      stompClientRef.current = mockClient;
      setClient(mockClient);
      setConnected(true);
    });
  }, [sessionId, connected]);

  const disconnect = useCallback(() => {
    if (stompClientRef.current) {
      if (stompClientRef.current.disconnect) {
        stompClientRef.current.disconnect();
      }
      stompClientRef.current = null;
      setClient(null);
      setConnected(false);
    }
  }, []);

  const subscribe = useCallback((topic, callback) => {
    if (client && connected) {
      const sub = client.subscribe(topic, (message) => {
        const data = JSON.parse(message.body);
        setEvents((prev) => [...prev, data]);
        if (callback) callback(data);
      });
      subscriptions.current[topic] = sub;
    }
  }, [client, connected]);

  const publish = useCallback((destination, body) => {
    if (client && connected) {
      client.send(destination, {}, JSON.stringify(body));
    }
  }, [client, connected]);

  useEffect(() => {
    connect();
    return () => {
      if (stompClientRef.current) {
        if (stompClientRef.current.disconnect) {
          stompClientRef.current.disconnect();
        }
        stompClientRef.current = null;
      }
    };
  }, [connect]);

  return { client, connected, events, subscribe, publish };
};

export default useStomp;
