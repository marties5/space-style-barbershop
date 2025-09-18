import { Button } from "@/components/ui/button";
import Link from "next/link";
const NotFound = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div>not-found</div>
      <Link href="/">
        <Button className="ml-4">Go Home</Button>
      </Link>
    </div>
  );
};

export default NotFound;
