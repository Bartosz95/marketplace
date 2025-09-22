import NavigationBar from "@/components/NavigationBar";
import AuthProvider from "@/providers/AuthProvider";
import { Container } from "react-bootstrap";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NavigationBar />
          <Container>{children}</Container>
        </AuthProvider>
      </body>
    </html>
  );
}
