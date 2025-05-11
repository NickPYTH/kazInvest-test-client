import {Card, Flex, GetProps, Input, notification, NotificationArgsProps, Space} from "antd";
import React, {useEffect, useState} from "react";
import {AudioOutlined} from "@ant-design/icons";
import {messageAPI} from "service/MessageService";

type SearchProps = GetProps<typeof Input.Search>;

const { Search } = Input;

type NotificationPlacement = NotificationArgsProps['placement'];

const Context = React.createContext({ name: 'Default' });


const MainPage = () => {

    // States
    const [api, contextHolder] = notification.useNotification();
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    // -----

    // Notification
    const openNotification = (placement: NotificationPlacement, msg:string) => {
        api.info({
            message: `Oops!`,
            description: <Context.Consumer>{({ name }) => `${msg}`}</Context.Consumer>,
            placement,
        });
    };
    // -----

    // Web requests
    const [askAI, {
        data,
        error,
        isLoading
    }] = messageAPI.useAskMutation();
    // -----

    // Effects
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.log('Web Speech API is not supported in this browser.');
            return;
        }

        //@ts-ignore
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;  // Show partial results

        recognition.onstart = () => {
            setIsListening(true);
            console.log('Voice recognition started');
        };

        recognition.onresult = (event:any) => {
            let currentTranscript = transcript;
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    currentTranscript += event.results[i][0].transcript;
                } else {
                    currentTranscript += event.results[i][0].transcript + ' ';
                }
            }
            setTranscript(currentTranscript);
        };

        recognition.onerror = (event:any) => {
            console.error('Error occurred in recognition: ' + event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
            console.log('Voice recognition ended');
        };

        const startListening = () => {
            recognition.start();
        };

        const stopListening = () => {
            recognition.stop();
        };

        if (isListening) {
            startListening();
        } else {
            stopListening();
        }

        return () => {
            recognition.stop(); // Clean up recognition on unmount
        };
    }, [isListening]);
    useEffect(() => {
        if (error) {
            let localError: {data: { error: string }} = error as {data: { error: string }};
            openNotification("topRight", localError.data?.error);
        }
    }, [error]);
    // -----

    // Handlers
    const toggleListening = () => {
        setIsListening(!isListening);
    };
    const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
        if (transcript) askAI({question: transcript});
        else openNotification("topRight", "Empty question");
    };
    // -----

    // Component
    const audioSuffix = (
        <div className={isListening ? "pulse" : ""}>
            <AudioOutlined
                onClick={toggleListening}
                style={{
                    fontSize: 16,
                    color: '#1677ff',
                }}
            />
        </div>
    );
    // -----

    return(
        <Flex style={{height: window.innerHeight, width: window.innerWidth}} justify="center" align="center">
            {contextHolder}
            <Space direction="vertical" style={{width: 400}}>
                <Search
                    disabled={isLoading}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="enter a question"
                    enterButton="ask"
                    size="large"
                    suffix={audioSuffix}
                    onSearch={onSearch}
                />
                {data && <Card>
                    {data.answer}
                </Card>
                }
            </Space>
        </Flex>
    )
}

export default MainPage;