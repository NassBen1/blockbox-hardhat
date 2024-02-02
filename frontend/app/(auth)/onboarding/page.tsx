"use client"
import React, {useEffect, useState} from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Web3 from 'web3';
import { contractAddress } from "@/constants/global";
import contractABI from "@/constants/contractABI";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Props {
    user: {
        id: string;
        objectId: string;
        username: string;
        name: string;
        bio: string;
        image: string;
        isRegistered: boolean;
    };
    btnTitle: string;
}

interface FormValues {
    username: string;
    bio: string;
}

const Page: React.FC<Props> = ({ user, btnTitle }: Props) => {
    const [isUserRegistered, setIsUserRegistered] = useState<boolean | null>(null);
    const { register, handleSubmit } = useForm<FormValues>();
    const checkUserRegistration = async () => {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const accounts = await web3.eth.getAccounts();
        const userAddress = accounts[0];

        try {
            const result: boolean = await contract.methods.isRegistered().call({ from: userAddress });
            console.log('L\'utilisateur est enregistré :', result);
            setIsUserRegistered(result);
            console.log('Utilisateur enregistré avec succès sur la blockchain!');
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'enregistrement de l\'utilisateur:', error);
        }
    };

    useEffect(() => {
        checkUserRegistration();
    }, []); // Appeler la fonction lorsque le composant est monté

    useEffect(() => {
        // Cet effet se déclenche chaque fois que isUserRegistered change
        console.log('Valeur de isUserRegistered mise à jour :', isUserRegistered);


        // Ajoutez ici des actions supplémentaires en fonction de la valeur de isUserRegistered
    }, [isUserRegistered]);

    const onSubmit = async function (values: FormValues) {
        console.log("Hello");
        try {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                await window.ethereum.enable();
                const contract = new web3.eth.Contract(contractABI, contractAddress);
                const accounts = await web3.eth.getAccounts();
                const userAddress = accounts[0];
                const userData = {
                    _username: values.username,
                    _userAddress: userAddress,
                    _bio: values.bio
                };

                await contract.methods.registerUser(userData._username, userData._bio).send({ from: userAddress });


                // Rediriger l'utilisateur vers l'accueil ("/")
                window.location.href = "/";
            } else {
                console.error('MetaMask n\'est pas installé');
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement de l\'utilisateur sur la blockchain:', error);
        }
    };


    return (

                <div>
                    {/* Afficher le formulaire d'inscription si l'utilisateur n'est pas enregistré */}
                    <h1 className="text-3xl font-bold text-light-2"></h1>
                    <h1 className=" head-text font-bold text-light-2">Inscrivez-vous</h1>
                    <h2 className="flex text-xl text-light-2">Rejoignez des milliers d'utilisateurs sur le réseau
                        Ethereum</h2>
                    <div className="flex items-center gap-3 w-full">
                        <label htmlFor="username" className="text-base-semibold text-light-2">
                            Username
                        </label>
                        <Input
                            type="text"
                            id="username"
                            className="text-light-2 bg-dark-1"
                            {...register('username')}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full">
                        <label htmlFor="bio" className="text-base-semibold text-light-2">
                            Bio
                        </label>
                        <Textarea
                            rows={5}
                            id="bio"
                            className="text-light-2 bg-dark-1"
                            {...register('bio')}
                        />
                    </div>
                    <Button onClick={handleSubmit(onSubmit)} className="bg-primary-500">
                        Enregistrez-vous
                    </Button>
                </div>


    );
};

export default Page;