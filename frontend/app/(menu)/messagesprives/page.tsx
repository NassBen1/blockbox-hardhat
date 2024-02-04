// @ts-nocheck
"use client"
import React, { useEffect, useState } from "react";
import Web3 from 'web3';
import contractABI from "@/constants/contractABI";
import { contractAddress } from "@/constants/global";

interface CurrentUser {
    username: string;
    bio: string;
}

interface DirectMessage {
    sender: string;
    receiver: string;
    content: string;
    timestamp: number;
}

const Page: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [messagedUsernames, setMessagedUsernames] = useState<string[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [messages, setMessages] = useState<DirectMessage[]>([]);

    const fetchUserData = async (): Promise<void> => {
        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts ? accounts[0] : '';
            let currentUserInfo: any;

            currentUserInfo = await contract.methods.getCurrentUser().call({ from: userAddress });
            setCurrentUser(currentUserInfo);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'utilisateur :", error);
        }
    };

    const fetchMessagedUsernames = async (): Promise<void> => {
        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            const usernames = await contract.methods.getAllMessagedUsernames().call() as string[];

            setMessagedUsernames(usernames);
        } catch (error) {
            console.error("Erreur lors de la récupération des usernames messagés :", error);
        }
    };

    const fetchMessagesWithUser = async (targetUsername: string): Promise<void> => {
        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts ? accounts[0] : '';
            const result: any = await contract.methods.getAllMessagesWithUser(targetUsername).call({ from: userAddress });

            if (result) {
                const senders = Array.isArray(result['0']) ? result['0'] : result['0'].split(',');
                const receivers = Array.isArray(result['1']) ? result['1'] : result['1'].split(',');
                const messages = Array.isArray(result['2']) ? result['2'] : result['2'].split(',');
                const timestamps = Array.isArray(result['3']) ? result['3'] : result['3'].split(',').map(Number);

                const directMessages: DirectMessage[] = messages.map((message: any, index: any) => ({
                    sender: senders[index],
                    receiver: receivers[index],
                    content: message,
                    timestamp: timestamps[index],
                }));

                setMessages(directMessages);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des messages avec l'utilisateur :", error);
        }
    };

    useEffect(() => {
        fetchUserData();
        fetchMessagedUsernames();
        const urlSearchParams = new URLSearchParams(window.location.search);
        const selectedUserParam = urlSearchParams.get('selectedUser');

        if (selectedUser || selectedUserParam) {
            if (selectedUserParam) {
                setSelectedUser(selectedUserParam)
            }

            if (selectedUser) {
                setSelectedUser(selectedUser)
            }
            fetchMessagesWithUser(selectedUser!);
        }
    }, [selectedUser]);

    const handleUserClick = (username: string) => {
        setSelectedUser(username);
    };

    const handleSendMessage = async (message: string) => {
        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts ? accounts[0] : '';

            await contract.methods.sendMessageDirectlyByUsername(selectedUser, message).send({ from: userAddress });

            fetchMessagesWithUser(selectedUser!);
        } catch (error) {
            console.error("Erreur lors de l'envoi du message :", error);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSendMessage(event.currentTarget.value);
            event.currentTarget.value = '';
        }
    };

    return (
        <div className="w-full container mx-auto shadow-lg rounded-lg">
            {/* Header */}
            <div className="w-full px-5 py-5 flex justify-between items-center bg-dark-4 border-b-2">
                {currentUser && (
                    <div className="font-semibold text-2xl text-light-2 text-center mx-auto">
                        Messages privés de : {currentUser.username}
                    </div>
                )}
            </div>
            {/* End Header */}

            {/* Chatting */}
            <div className="flex flex-row justify-between bg-white">
                {/* Chat List */}
                <div className="flex flex-col w-2/5 border-r-2 overflow-y-auto">
                    {/* User List */}
                    {messagedUsernames.map((username, index) => (
                        <div
                            key={index}
                            className={`flex flex-row py-4 px-2 justify-center items-center border-b-2 cursor-pointer ${
                                selectedUser === username ? 'bg-gray-200' : ''
                            }`}
                            onClick={() => handleUserClick(username)}
                        >
                            <div className="w-1/4"></div>
                            <div className="w-full">
                                <div className="text-lg font-semibold">{username}</div>
                                <span className="text-gray-500">Lancer la conversation</span>
                            </div>
                        </div>
                    ))}
                    {/* End User List */}
                </div>
                {/* End Chat List */}

                {/* Message */}
                <div className="w-full px-5 flex flex-col justify-between">
                    <div className="flex flex-col mt-5">
                        {/* Affichage des messages avec l'utilisateur */}
                        {messages.map((message, index) => (
                            <div key={index} className={`flex mb-2 ${currentUser?.username === message.sender ? 'justify-end' : 'justify-start'}`}>
                                {currentUser?.username === message.sender ? (
                                    <div className="rounded py-2 px-3" style={{ backgroundColor: "#E2F7CB" }}>
                                        <p className="text-sm mt-1">{message.content}</p>
                                    </div>
                                ) : (
                                    <div className="rounded py-2 px-3" style={{ backgroundColor: "#F2F2F2" }}>
                                        <p className="text-sm text-orange">{message.sender}</p>
                                        <p className="text-sm mt-1">{message.content}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="py-5">
                        {(selectedUser) ? (
                            <input
                                className="w-full bg-gray-300 py-5 px-3 rounded-xl"
                                type="text"
                                placeholder="type your message here..."
                                onKeyDown={handleKeyDown}
                            />
                        ) : (
                            <div className="text-center text-gray-500">
                                Bienvenue à la messagerie
                            </div>
                        )}
                    </div>
                </div>
                {/* End Message */}
            </div>
        </div>
    );
};

export default Page;
