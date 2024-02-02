"use client"
import Web3 from 'web3';
import contractABI from "@/constants/contractABI";
import {contractAddress} from "@/constants/global";
import {useEffect, useState} from "react";

// Page.tsx

import React from "react";

const Page: React.FC = () => {
    const [searchInput, setSearchInput] = useState<string>("");
    const [searchResults, setSearchResults] = useState<string[]>([]);

    // Remplacez par l'adresse correcte de votre contrat
    contractAddress;
    contractABI; // Remplacez par le nom correct de votre ABI

    useEffect(() => {
        // Initialise Web3


        // Fonction pour appeler la recherche
        const searchUsernames = async () => {
            try {
                const web3 = new Web3(window.ethereum);
                const contract = new web3.eth.Contract(contractABI, contractAddress);
                const accounts = await web3.eth.getAccounts();
                const userAddress = accounts[0];
                const result = await contract.methods
                    .searchUsernamesByWord(searchInput)
                    .call();

                // Met à jour les résultats de recherche dans le state
                setSearchResults(result);
                console.log(result)
            } catch (error) {
                console.error("Erreur lors de la recherche :", error);
            }
        };

        // Appelle la fonction de recherche lorsqu'il y a un changement dans searchInput
        searchUsernames();
    }, [searchInput, contractABI, contractAddress]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        // Check if the key pressed is Enter (key code 13)
        if (event.key === "Enter") {
            // Perform the search or any other action you want on pressing Enter
            console.log("Enter key pressed");
            // Call your search function here
            // Example: searchUsernames();
        }
    };

    const redirectToProfile = (username: string) => {
        window.location.href = `/profil?username=${username}`;
    };

    return (
        <div className="w-4/6 z-50 relative mx-auto mt-36">
            <div className="bg-white w-full h-16 rounded-xl mb-3 shadow-lg p-2">
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full h-full text-2xl rounded-lg focus:outline-none focus:ring focus:border-blue-300"
                    value={searchInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <div className="bg-white w-full rounded-xl shadow-xl overflow-hidden p-1">
                {searchResults.map((result, index) => (
                    <div
                        key={index}
                        className="w-full flex p-3 pl-4 items-center hover:bg-gray-300 rounded-lg cursor-pointer"
                        onClick={() => redirectToProfile(result)}
                    >
                        <div className="mr-4">
                            {/* Replace this part with your icon or image */}
                        </div>
                        <div>
                            {/* Affichez le résultat de la recherche dans la boucle */}
                            <div className="font-bold text-lg">Name: {result}</div>
                            {/* ... (autres informations) ... */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Page;
