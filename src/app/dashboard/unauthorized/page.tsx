import { UnauthorizedPage } from "@/middleware/roleGuard";

export default function UnauthorizedRoute() {
  return <UnauthorizedPage />;
}