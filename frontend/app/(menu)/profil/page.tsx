"use client";
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Web3 from 'web3';
import { contractAddress } from "@/constants/global";
import contractABI from "@/constants/contractABI";

interface CurrentUser {
    username: string;
    bio: string;
    // ... autres propriétés de currentUser
}

const Page = () => {
    const { user } = useUser();
    const isConnectedWithMetamask = user?.publicMetadata?.ethAddress != null;
    const [followerCount, setFollowerCount] = useState<number | null>(null);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [postCount, setPostCount] = useState<number | null>(null);
    const [showFollow, setshowFollow] = useState<boolean>(false);
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const fetchFollowerCount = async (): Promise<void> => {
        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];

            // Extraire le paramètre username de l'URL
            const urlSearchParams = new URLSearchParams(window.location.search);
            const usernameParam = urlSearchParams.get('username');
            console.log(usernameParam)

            let count;

            if (usernameParam) {
                // Si le paramètre username est présent dans l'URL, utilisez la fonction getUserByUsername du smart contrat
                count = await contract.methods.getFollowerCountByUsername(usernameParam).call({ from: userAddress });
            } else {
                // Sinon, utilisez la fonction getFollowerCount du smart contrat avec l'adresse de l'utilisateur actuel
                count = await contract.methods.getFollowerCount(userAddress).call();
            }

            // Vérification de type pour s'assurer que count est un nombre
            if (!isNaN(Number(count))) {
                setFollowerCount(Number(count));
            } else {
                console.error('Le nombre de followers récupéré n\'est pas un nombre valide.');
            }

            // Récupérer les informations de l'utilisateur actuel ou du username fourni
            let currentUserInfo: CurrentUser | null;

            if (usernameParam) {
                try {
                    currentUserInfo = await contract.methods.getUserByUsername(usernameParam).call();
                } catch (getUserError) {
                    console.error('Erreur lors de la récupération de l\'utilisateur par username :', getUserError);
                    currentUserInfo = null;
                }
            } else {
                currentUserInfo = await contract.methods.getCurrentUser().call({ from: userAddress });
            }


            setCurrentUser(currentUserInfo);
            setIsLoading(false);  // Marquer que le chargement est terminé

            if (usernameParam) {
                let userConnected : any;
                userConnected = await contract.methods.getCurrentUser().call({ from: userAddress });
                if (usernameParam !== userConnected.username)
                    setshowFollow(true)
            }

            let following : any;

            if (currentUser && user) {
                following = await contract.methods.isFollowing(currentUser.username, user.publicMetadata.ethAddress).call({ from: userAddress });
                setIsFollowing(following);
            }

        } catch (error) {
            console.error('Erreur lors de la récupération du nombre de followers :', error);
            setIsLoading(false);  // Marquer que le chargement est terminé en cas d'erreur
        }
    };

    useEffect(() => {
        fetchFollowerCount();
    }, []);

    const NewFollow = async (currentUser: CurrentUser): Promise<void> => {
        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];

            if (currentUser && currentUser.username) {
                // Utilisez la fonction followUserByUsername du smart contrat
                try {
                    await contract.methods.followUser(currentUser.username).send({ from: userAddress });
                    const successMessage = `Vous suivez maintenant ${currentUser.username}`;
                    fetchFollowerCount();
                    window.alert(successMessage);

                } catch (error) {
                    console.error('Erreur lors du suivi de l\'utilisateur par username :', error);
                }
            } else {
                console.error('Impossible de suivre un utilisateur sans spécifier le username.');
            }
        } catch (error) {
            console.error('Erreur lors du suivi de l\'utilisateur :', error);
        }
    };

    const unfollowUser = async () => {
        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];

            // Vérifier si l'utilisateur est actuellement suivi
            const isFollowing = await contract.methods.isFollowing(currentUser?.username).call({ from: userAddress });

            if (isFollowing) {
                await contract.methods.unfollowUser(currentUser?.username).send({ from: userAddress });
                const successMessage = `Vous ne suivez plus ${currentUser.username}`;
                fetchFollowerCount();
                window.alert(successMessage);

            } else {
                console.error('Vous ne suivez pas encore cet utilisateur.');
            }
        } catch (error) {
            console.error('Erreur lors du désabonnement de l\'utilisateur :', error);
        }
    };


    // Fonction pour vérifier si l'utilisateur actuel suit un autre utilisateur
    const checkIsFollowing = async () => {
        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];

            // Remplacez 'usernameToCheck' par le nom d'utilisateur que vous souhaitez vérifier
            const usernameToCheck = currentUser?.username;

            let result:any;
            if (usernameToCheck) {
                result = await contract.methods.isFollowing(usernameToCheck).call({ from: userAddress });

                // Mettez à jour l'état avec le résultat
                setIsFollowing(result);
            } else {
                console.error('Nom d\'utilisateur manquant pour la vérification du suivi.');
            }
        } catch (error) {
            console.error('Erreur lors de la vérification si l\'utilisateur suit :', error);
        }
    };

    useEffect(() => {
        // Appelez la fonction de vérification au chargement de la page
        checkIsFollowing();
    }, []);

    const fetchPostCountByUsername = async (user: CurrentUser | null): Promise<number | null> => {
        try {
            if (!user) {
                console.error('CurrentUser is null');
                return null;
            }

            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            const accounts = await web3.eth.getAccounts();
            const userAddress = accounts[0];

            const postCountResult = await contract.methods.getPostCountByUsername(user.username).call({ from: userAddress });
            const postCount = Number(postCountResult);

            if (!isNaN(postCount)) {
                return postCount;
            } else {
                console.error('Le nombre de posts récupéré n\'est pas un nombre valide.');
                return null;
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du nombre de posts :', error);
            return null;
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchPostCountByUsername(currentUser).then((count) => {
                if (count !== null) {
                    setPostCount(count);
                }
            });
        }
    }, [currentUser]);

    return (
        <>
            {isLoading ? (
                // Afficher un indicateur de chargement ici
                <div>Loading...</div>
            ) : currentUser ? (
                <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg mt-16">
                    <div className="flex flex-wrap justify-center">
                        <div className="w-full px-4 flex justify-center">
                            <div className="relative">
                                <img
                                    alt=""
                                    src={isConnectedWithMetamask ? '/metamask-profile-picture.jpg' : '/default-profile-picture.jpg'}
                                    className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
                                />
                            </div>
                        </div>
                        <div className="w-full px-4 text-center mt-20">
                            <div className="flex justify-center py-4 lg:pt-4 pt-8">
                                <div className="mr-4 p-3 text-center">
                                <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                                    {followerCount}
                                </span>
                                    <span className="text-sm text-blueGray-400">Followers</span>
                                </div>
                                <div className="lg:mr-4 p-3 text-center">
                                <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                                    {postCount}
                                </span>
                                    <span className="text-sm text-blueGray-400">Blocks</span>
                                </div>
                                {showFollow && (
                                    <>
                                        <button
                                            className={`float-left bg-primary-500 hover:bg-dark-2 text-white font-bold py-2 px-4 rounded ${isFollowing ? 'bg-red-500' : ''}`}
                                            onClick={async () => {
                                                if (currentUser) {
                                                    if (isFollowing) {
                                                        // Appeler la fonction Unfollow
                                                        await unfollowUser();
                                                    } else {
                                                        // Appeler la fonction Follow
                                                        await NewFollow(currentUser);
                                                    }
                                                    // Ajoutez ici toute logique supplémentaire après le suivi ou le désabonnement (si nécessaire)
                                                }
                                            }}
                                        >
                                            {isFollowing ? 'Unfollow' : 'Follow'}
                                        </button>
                                        <button
                                            className="float-left bg-primary-500 hover:bg-dark-2 text-white font-bold py-2 px-4 rounded"
                                            onClick={() => {
                                                // Utiliser window.location.assign pour naviguer avec le paramètre selectedUser ou currentUser si selectedUser n'est pas défini
                                                const targetUser =  (currentUser && currentUser.username);
                                                const encodedUsername = encodeURIComponent(targetUser || '');
                                                window.location.assign(`/messagesprives?selectedUser=${encodedUsername}`);
                                            }}
                                        >
                                            Message
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-12">
                        <div className="text-sm leading-normal mt-0 mb-2 text-blueGray-400 font-bold uppercase">
                            <i className="fas fa-map-marker-alt mr-2 text-lg text-blueGray-400"></i>
                            {currentUser.username}
                        </div>
                    </div>
                    <div className="mt-10 py-10 border-t border-blueGray-200 text-center">
                        <div className="flex flex-wrap justify-center">
                            <div className="w-full lg:w-9/12 px-4">
                                <p className="mb-4 text-lg leading-relaxed text-blueGray-700">
                                    {currentUser.bio}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Afficher une page d'utilisateur introuvable si currentUser est null
                <div className="w-full px-4 flex justify-center text-light-2">Utilisateur introuvable</div>
            )}
        </>
    );

};

export default Page;