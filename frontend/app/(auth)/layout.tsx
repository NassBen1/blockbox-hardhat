import {ClerkProvider} from "@clerk/nextjs";
import {Inter} from "next/font/google";
import '../globals.css'
import Topbar from "@/components/shared/Topbar";

export const metadata = {
    title: 'BlockBox',
    description: 'Le réseau social décentralisé'
}

const inter = Inter({subsets: ["latin"]})

export default function RootLayout({children }: { children: React.ReactNode}) {

    return (
        <ClerkProvider>
            <html lang="en">
            <Topbar/>
            <section className="main-container">
                <body className={`${inter.className} bg-dark-1 ml-48 mt-40`}>
                {children}
                </body>
            </section>
            </html>
        </ClerkProvider>
)

}