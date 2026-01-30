import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({
    subsets: ["latin"],
    variable: "--font-fraunces",
    display: 'swap',
});

export const metadata = {
    title: "Lekha Jokha",
    description: "Professional digital ledger for daily expenses",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${fraunces.variable} antialiased bg-crust text-text`}>
                <div className="grain-overlay" />
                {children}
            </body>
        </html>
    );
}
