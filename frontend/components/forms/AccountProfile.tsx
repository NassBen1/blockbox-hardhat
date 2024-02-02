"use client"
import { useForm } from 'react-hook-form';
import { ethers } from 'ethers';
import { contractAddress } from "@/constants/global";
import contractABI from "@/constants/contractABI";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { zodResolver } from '@hookform/resolvers/zod';
import { UserValidation } from "@/lib/validations/user";
import * as z from 'zod';
import { Button } from '../ui/button';
import { ChangeEvent } from "react";
import { Textarea } from "@/components/ui/textarea";

interface Props {
    user: {
        id: string;
        objectfId: string;
        username: string;
        name: string;
        bio: string;
        image: string;
    };
    btnTitle: string;
}

const SimpleAccountProfile = ({ user, btnTitle }: Props) => {
    const form = useForm({
        resolver: zodResolver(UserValidation),
        defaultValues: {
            username: user?.username || "",
            bio: user?.bio || ""
        }
    });

    const onSubmit = async (values: { username: string; bio: string }) => {

        try {
            // Ensure you have an instance of your contract
            contractAddress;
            contractABI;
            console.log("Loaded");
            console.log(contractAddress);

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            // Get the Ethereum address of the connected user
            const userAddress = await signer.getAddress();

            // Format the form data to pass to the contract function
            const userData = {
                username: values.username,
                userAddress: userAddress,
                // ... Add other form fields as needed
            };

            // Call the contract function to update the profile
            const transaction = await contract.updateUserProfile(
                userData.username,
                userData.userAddress,
                // ... Pass other arguments according to the contract function
            );

            // Wait for transaction confirmation
            await transaction.wait();

            console.log('Profile successfully updated on the blockchain!');
        } catch (error) {
            console.error('Error updating profile on the blockchain:', error);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-start gap-10">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem className="flex items-center gap-3 w-full">
                            <FormLabel className="text-base-semibold text-light-2">
                                Username
                            </FormLabel>
                            <FormControl className="flex-1 text-base-semibold text-gray-200">
                                <Input
                                    type='text'
                                    className="text-light-2 bg-dark-1"
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem className="flex items-center gap-3 w-full">
                            <FormLabel className="text-base-semibold text-light-2">
                                Bio
                            </FormLabel>
                            <FormControl className="flex-1 text-base-semibold text-gray-200">
                                <Textarea
                                    rows={5}
                                    className="text-light-2 bg-dark-1"
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit" className="bg-primary-500">
                    {btnTitle}
                </Button>
            </form>
        </Form>
    );
};

export default SimpleAccountProfile;
