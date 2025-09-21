'use client';

import { Chat } from '@/components/Chat';
import { ChatList } from '@/components/ChatList';
import { LLMPicker } from '@/components/LLMPicker';
import { Question } from '@/components/Question';
import { SystemPrompt } from '@/components/SystemPrompt';
import { MQ_MAX_WIDTH } from '@/constants/list';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import usePersistentState from '@/hooks/usePersistentState';
import { ActionIcon } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { Sidebar, Tool } from 'react-feather';

const HomePage: React.FC = (): React.ReactElement => {
  const [showChatList, setShowChatList] = usePersistentState<boolean>(STORAGE_KEYS.showChatList, true);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const isMobile: boolean = useMediaQuery(`(max-width: ${MQ_MAX_WIDTH}px)`);

  useEffect(() => {
    const setAppHeight = (): void => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    window.addEventListener('resize', setAppHeight);
    setAppHeight();
    return () => window.removeEventListener('resize', setAppHeight);
  }, []);

  const toggleChatList = (): void => setShowChatList(!showChatList);

  return (
    <div className='appContainer'>
      <ChatList show={showChatList} />
      <div className={`mainPanel ${showChatList && 'shifted'}`}>
        {isMobile && showChatList && <div className='backdrop' onClick={toggleChatList}></div>}
        <div className='header'>
          <ActionIcon onClick={toggleChatList}>
            <Sidebar />
          </ActionIcon>
          <ActionIcon onClick={() => setShowSettings(!showSettings)}>
            <Tool />
          </ActionIcon>
        </div>
        {showSettings && (
          <div className='configContainer'>
            <LLMPicker />
            <SystemPrompt />
          </div>
        )}
        <Chat />
        <Question />
      </div>
    </div>
  );
};

export default HomePage;