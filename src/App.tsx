import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// 타입 선언 확장
interface Navigator {
  setAppBadge: (contents?: number) => Promise<void>;
  clearAppBadge: () => Promise<void>;
}

const socket = io('https://679e7f69483f8d0697057d18c41d0366.serveo.net');

socket.on('connect', () => {
  console.log('Connected to server'); // WebSocket 연결 확인
});

socket.on('disconnect', () => {
  console.log('Disconnected from server'); // 연결 끊김 확인
});

const App = () => {
  const [messages, setMessages] = useState<{ sender: string, message: string }[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [username, setUsername] = useState<string>('Anonymous');
  // const [unreadMessages, setUnreadMessages] = useState<number>(0);

  useEffect(() => {
    socket.on('messageToClient', (message: { sender: string, message: string }) => {
      setMessages((prevMessages) => [...prevMessages, message]);

      // 자신이 보낸 메시지가 아니고 페이지가 비활성화 상태일 때 미확인 메시지 증가
      // if (message.sender !== username && document.visibilityState === 'hidden') {
      //   setUnreadMessages((prevUnread) => prevUnread + 1);
      // }
    });

    // 클린업 함수로 이벤트 핸들러 제거
    return () => {
      socket.off('messageToClient');
    };
  }, [username]);

  // 배지 업데이트
  // useEffect(() => {
  //   if ('setAppBadge' in navigator) {
  //     if (unreadMessages > 0) {
  //       (navigator as any).setAppBadge(unreadMessages); // 미확인 메시지 수를 배지에 표시
  //     } else {
  //       (navigator as any).clearAppBadge(); // 미확인 메시지가 없으면 배지 제거
  //     }
  //   } else {
  //     console.log('Badging API not supported');
  //   }
  // }, [unreadMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 기본 제출 방지

    if (inputValue.trim() !== '') {
      // 서버로 메시지 전송
      socket.emit('messageToServer', { sender: username, message: inputValue });
      setInputValue(''); // 입력 필드 초기화
    }
  };

  // 페이지가 활성화되면 미확인 메시지 초기화
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.visibilityState === 'visible') {
  //       setUnreadMessages(0); // 페이지가 활성화되면 미확인 메시지 초기화
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, []);


  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        console.log('Service Worker Registered');
      });
    }
  }, []);

  const subscribeToPush = async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'BLMuqANzgt98IBfsEIeO1a7ZMhtKV73qqxWvn44oRhxamelcLU3jzEPXrXR9S_qy8JwfzeJzKhgCX8cvHNB7QG4', // VAPID 공개 키
    });

    if ('setAppBadge' in navigator) {
      (navigator as any).setAppBadge(5); // 숫자 5를 배지에 표시
    } else {
      console.log('Badging API not supported');
    }

    console.log('Subscription:', subscription);

    await fetch('https://679e7f69483f8d0697057d18c41d0366.serveo.net/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });
  };

  const badgeClear = () => {
    if ('clearAppBadge' in navigator) {
      (navigator as any).clearAppBadge(); // 배지 클리어
    } else {
      console.log('Badging API not supported');
    }
  }

  return (
    <div>
      <h1>Web Push Notifications</h1>
      <button onClick={subscribeToPush}>Subscribe to Push</button>
      <button onClick={badgeClear}>Badge Clear</button>
      <div>
        <h1>Real-Time Chat</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter your message"
            autoFocus
          />
          <button type="submit">Send</button>
        </form>

        <ul>
          {messages.map((msg, index) => (
            <li key={index}>
              <strong>{msg.sender}: </strong>
              {msg.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;