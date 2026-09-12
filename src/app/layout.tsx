import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "ReUseChain | Device-Afterlife Operating System",
  description: "Governed decision loop and component-level circularity operating system for enterprise and campus fleets.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="app-container">{children}</main>
      </body>
    </html>
  );
}
