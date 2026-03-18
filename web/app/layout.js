import "./globals.css";

export const metadata = {
  title: "FitMan",
  description: "FitMan MVP web app"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
