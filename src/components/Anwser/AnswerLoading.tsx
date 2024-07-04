import { Stack } from "@fluentui/react";
import { animated, useSpring } from "@react-spring/web";

import styles from "./Answer.module.css";
import { AnswerIcon } from "./AnswerIcon";


import {useEffect, useRef, useState} from "react";
import { chatSocket } from "./chatSocket";
import { useElementDimensions } from "../../hooks/useElementDimensions";
import { observer } from "mobx-react-lite";
import { useStore } from "../../hooks/useStore";
import { ERROR_COUNT_MAX, ERROR_DEFAULT, ERROR_NETWORK, ERROR_NETWORK_MAX } from "../../utils/errorChatResult";


const INIT_LOADING_ANSWER = '';
export const AnswerLoading = observer((
    {
      requestSocket,
      receivedSocketData,
      onErrorSocket,
      isShowTextGen,
      onChangeHeight
    } : {
          requestSocket: any,
          receivedSocketData: any,
          isShowTextGen: boolean,
          onErrorSocket: any,
          onChangeHeight: Function,
        }) => {
    const animatedStyles = useSpring({
        from: { opacity: 0 },
        to: { opacity: 1 }
    });


    const {
        rootStore: { sessionChatsStore },
      } = useStore();
    const elementRef = useRef<any>()
    const connected = useRef<boolean>(false)

    const {height} = useElementDimensions(elementRef)

    const [answer, setAnswer] = useState<string>('');
    const disconnectSocket = () => {
        chatSocket.off("chat_on_response_chunk");
        chatSocket.off("chat_on_response_all");
        chatSocket.off("chat_on_response_error");
        chatSocket.off("disconnect");
        chatSocket.off("error");
        chatSocket.disconnect();
    }

    useEffect(() => {
        if(isShowTextGen) {
          const timer = setTimeout(() => onTimeout() , 30 * 1000)
          chatSocket.connect();
          sendSocketData();
          listeningSocket();
          return () => {
            clearTimeout(timer);
            disconnectSocket();
          }
        }
    }, []);

    useEffect(() => {
        if (height > 0 && isShowTextGen) {
          onChangeHeight()
        }
    }, [height])

    const listeningSocket = () => {
        chatSocket.on('connect_error', conectError);
        chatSocket.on("chat_on_response_chunk",receivingSocketData);
        chatSocket.on("chat_on_response_all",receivedSocketData2);
        chatSocket.on("chat_on_response_error", receivedError);
        chatSocket.on("disconnect",onError);
        chatSocket.on("error",onError);
    };

    const conectError = () => {
        const errorCount = sessionChatsStore.errorCountNetwork
        onError({ error: errorCount < ERROR_COUNT_MAX ? ERROR_NETWORK : ERROR_NETWORK_MAX })
    }
    const onError = (data: any) => {
        chatSocket.sendBuffer = [];
        disconnectSocket();
        onErrorSocket(data, requestSocket?.question, requestSocket?.id , requestSocket?.retry) 
    }
    
    const receivedError = (data: any) => {
        sessionChatsStore.updateErrorCountNetwork(0)
        onError(data)
    }

    const receivedSocketData2 = (data: any) => {
        sessionChatsStore.updateErrorCountNetwork(0)
        disconnectSocket();
        chatSocket.disconnect();
        receivedSocketData(data, requestSocket?.question, requestSocket?.id , requestSocket?.retry)
    }

    const sendSocketData = () => {
        chatSocket.emit("request_chatbot", JSON.stringify(requestSocket.request));
    };

    const receivingSocketData = (data: any) => {
        let content = data ?? '';
        if(content.length && content.length > 0) {
            connected.current = true
            setAnswer(preAnswer => preAnswer + content)
        }
    };

    
    const onTimeout = () => {
        if(connected?.current) {
            console.log('connected')
        } else {
          console.log('timeout SocketData` ');
          onError({error: `${ERROR_NETWORK}`})
        }
        
    }

    return (
        <animated.div style={{ ...animatedStyles }} ref={elementRef} >
            <Stack className={`${styles.answerContainer} ${answer.length > 0 ? '' : styles.answerContainerLoading}`} verticalAlign="space-between">
                <AnswerIcon />
                <Stack.Item grow>
                { answer.length > 0 ?
                    <p className={styles.answerText}>
                        {answer}
                        <span className={styles.loadingdots} />
                    </p>
                    :
                    <div className="ticontainer" style={{marginLeft: "1rem"}}>
                        <div className="tiblock">
                            <div className="tidot"></div>
                            <div className="tidot"></div>
                            <div className="tidot"></div>
                        </div>
                    </div>
                }              
                </Stack.Item>
            </Stack>
        </animated.div>
    );
});
