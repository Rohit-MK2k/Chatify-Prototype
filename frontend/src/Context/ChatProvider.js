import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { signal } from "@preact/signals-react";

const ChatContext = createContext();
const emotiontxt = signal()
const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState();
  const [showEmotion, setTextBtn] = useState('Show my emotion')
  const [emotionIndex, setEmotionIndex] = useState()
  // const [emotiontxt, setEmotion] = useState()
  
  const [displayEmotion, setDisplay] = useState()
  const history = useHistory();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) history.push("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);
  let emotion_dict = {0: "Angry", 1: "Disgusted", 2: "Fearful", 3: "Happy", 4: "Neutral", 5: "Sad", 6: "Surprised"};

  const emotion = async () => {
    if (showEmotion === "Show my emotion") {
      setTextBtn("Don't Show Emotions")
    }
    else {
      setTextBtn("Show my emotion")
    }
  }
  emotiontxt.value = emotion_dict[emotionIndex]
  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        chats,
        setChats,
        emotion,
        showEmotion,
        setTextBtn,
        setEmotionIndex,
        emotiontxt,
        setDisplay,
        displayEmotion,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
