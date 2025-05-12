import {Button, Card, Flex, GetProps, Input, notification, NotificationArgsProps, Typography} from "antd";
import React, {useEffect, useState} from "react";
import {AudioOutlined, MessageOutlined} from "@ant-design/icons";
import {messageAPI} from "service/MessageService";

const { Title } = Typography;

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
    const openNotification = (placement: NotificationPlacement, header: string, msg:string) => {
        api.info({
            message: header,
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
            openNotification("topRight", "Oops", localError.data?.error);
        }
    }, [error]);
    // -----

    // Handlers
    const toggleListening = () => {
        setIsListening(!isListening);
    };
    const onSearch: SearchProps['onSearch'] = (value, _e, info) => {
        if (isLoading) {
            openNotification("topRight", "Oops", "Previous request in process");
            return;
        }
        if (transcript) {
            askAI({question: transcript});
            openNotification("topRight", "OK", "Request sent");
        }
        else openNotification("topRight", "Oops", "Empty question");
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
        <div style={{height: window.innerHeight, width: window.innerWidth}}>
            {contextHolder}
            <Flex vertical justify="space-evenly" style={{height: '100%', marginLeft: 150}}>
                <Flex vertical>
                    <Button icon={<MessageOutlined />} />
                    <Title style={{color: 'white', margin: "20px 0 20px 0"}} level={2}>Hi there!</Title>
                    <Title style={{color: 'white', margin: "0 0 20px 0"}}>What would you like to know?</Title>
                    <Title style={{color: 'white', margin: 0, opacity: 0.6, width: 430}} level={4}>Use one of the most common prompts below or ask your own question</Title>
                </Flex>
                <Search
                    style={{width: 500}}
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="enter a question"
                    enterButton="ask"
                    size="large"
                    suffix={audioSuffix}
                    onSearch={onSearch}
                />
                {data && <Card style={{width: 500}}>
                    {data.answer}
                </Card>
                }
            </Flex>
        </div>
    )
}

export default MainPage;